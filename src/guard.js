
export const SKILL_SAFE_QUESTIONS = {
  doc_hieu_de: "Con đọc lại đề xem bài toán cho biết gì và hỏi gì nào?",
  chon_phep_tinh: "Để tìm kết quả bước này, con nghĩ nên dùng phép cộng, trừ, nhân hay chia?",
  tinh_toan: "Con thử đặt tính hoặc tính nhẩm từng bước xem ra bao nhiêu nào?",
  don_vi: "Sau khi tính xong, đơn vị của kết quả bước này là gì con nhỉ?",
  viet_loi_giai: "Con hãy viết câu lời giải cho phép tính này nhé!",
  kiem_tra_lai: "Con thử kiểm tra lại xem kết quả bước này đã hợp lý chưa nào?",
  doc_hieu: "Con đọc kỹ lại đoạn văn để tìm chi tiết này nhé.",
  tu_vung: "Từ này có nghĩa là gì trong ngữ cảnh câu văn con nhỉ?",
  chinh_ta: "Con chú ý các nét chữ và dấu thanh để viết cho chuẩn nhé.",
  dat_cau: "Con hãy thử dùng từ này để đặt một câu hoàn chỉnh nào!",
  tu_vung_en: "Can you recall the meaning of this word?",
  ngu_phap: "Let's check the grammar rule for this sentence.",
  phat_am: "Listen carefully and practice saying this word out loud.",
  default: "Con thử nói cách suy nghĩ của con ở bước này nhé?",
};
/**
 * guard.js - Lõi An Toàn AI & Chặn Lộ Đáp Án (Prompt 14 · Đợt 4)
 * Shared module for test suites and client validation.
 */

// Bảng từ số đơn vị và thành phần trong tiếng Việt
export const VI_UNITS = {
  'không': 0,
  'một': 1, 'mốt': 1,
  'hai': 2,
  'ba': 3,
  'bốn': 4, 'tư': 4,
  'năm': 5, 'lăm': 5,
  'sáu': 6,
  'bảy': 7, 'bẩy': 7,
  'tám': 8,
  'chín': 9,
};

const VI_WORD_SET = new Set([
  'không', 'một', 'mốt', 'hai', 'hăm', 'ba', 'bốn', 'tư',
  'năm', 'lăm', 'sáu', 'bảy', 'bẩy', 'tám', 'chín',
  'mười', 'mươi', 'trăm', 'nghìn', 'ngàn', 'vạn', 'linh', 'lẻ'
]);

// Cụm từ thông dụng cần bảo vệ không bị chuyển thành số nhầm
export const PROTECTED_PHRASES = [
  'ba mẹ', 'ba má', 'cha mẹ', 'ba bề bốn bên',
  'năm nay', 'năm ngoái', 'năm tới', 'sang năm', 'mỗi năm', 'hằng năm', 'năm học',
  'ngày mốt', 'mốt thời trang', 'mốt mới',
  'bốn phương', 'tám chuyện'
];

// Regex Unicode phát hiện từ vựng số liên tiếp
const VI_WORD_REGEX = /(?<!\p{L})(?:không|một|mốt|hai|hăm|ba|bốn|tư|năm|lăm|sáu|bảy|bẩy|tám|chín|mười|mươi|trăm|nghìn|ngàn|vạn|linh|lẻ)(?:\s+(?:không|một|mốt|hai|hăm|ba|bốn|tư|năm|lăm|sáu|bảy|bẩy|tám|chín|mười|mươi|trăm|nghìn|ngàn|vạn|linh|lẻ))*(?!\p{L})/giu;

export function parseViNumberPhrase(phrase) {
  if (!phrase || typeof phrase !== 'string') return null;
  const raw = phrase.trim().toLowerCase();
  if (!raw) return null;

  if (raw === 'mười nghìn' || raw === 'mười ngàn' || raw === 'một vạn') return 10000;
  if (raw === 'không') return 0;
  if (VI_UNITS[raw] !== undefined) return VI_UNITS[raw];
  if (raw === 'mười') return 10;
  if (raw === 'hai mươi' || raw === 'hăm') return 20;

  const tokens = raw.split(/\s+/);
  for (const t of tokens) {
    if (!VI_WORD_SET.has(t)) return null;
  }

  let thousands = 0;
  let hundreds = 0;
  let tens = 0;
  let units = 0;
  let curTokens = [...tokens];

  const ngIdx = curTokens.findIndex(t => t === 'nghìn' || t === 'ngàn');
  if (ngIdx > 0) {
    const leftThous = curTokens.slice(0, ngIdx).join(' ');
    const tVal = parseViNumberPhrase(leftThous);
    if (tVal !== null && tVal > 0 && tVal <= 9) {
      thousands = tVal * 1000;
      curTokens = curTokens.slice(ngIdx + 1);
    } else {
      return null;
    }
  }

  const trIdx = curTokens.findIndex(t => t === 'trăm');
  if (trIdx >= 0) {
    const leftHund = curTokens.slice(0, trIdx).join(' ');
    if (leftHund === 'không') {
      hundreds = 0;
    } else {
      const hVal = parseViNumberPhrase(leftHund);
      if (hVal !== null && hVal >= 1 && hVal <= 9) {
        hundreds = hVal * 100;
      } else {
        return null;
      }
    }
    curTokens = curTokens.slice(trIdx + 1);
  }

  if (curTokens.length > 0) {
    if (curTokens[0] === 'linh' || curTokens[0] === 'lẻ') {
      if (curTokens.length === 2 && VI_UNITS[curTokens[1]] !== undefined) {
        units = VI_UNITS[curTokens[1]];
      } else {
        return null;
      }
    } else if (curTokens[0] === 'mười') {
      tens = 10;
      if (curTokens.length === 2 && VI_UNITS[curTokens[1]] !== undefined) {
        units = VI_UNITS[curTokens[1]];
      } else if (curTokens.length === 1) {
        units = 0;
      } else {
        return null;
      }
    } else {
      const mIdx = curTokens.findIndex(t => t === 'mươi');
      if (mIdx === 1) {
        const dVal = VI_UNITS[curTokens[0]];
        if (dVal !== undefined && dVal >= 2 && dVal <= 9) {
          tens = dVal * 10;
          if (curTokens.length === 3 && VI_UNITS[curTokens[2]] !== undefined) {
            units = VI_UNITS[curTokens[2]];
          } else if (curTokens.length === 2) {
            units = 0;
          } else {
            return null;
          }
        } else {
          return null;
        }
      } else if (curTokens[0] === 'hăm') {
        tens = 20;
        if (curTokens.length === 2 && VI_UNITS[curTokens[1]] !== undefined) {
          units = VI_UNITS[curTokens[1]];
        } else if (curTokens.length === 1) {
          units = 0;
        } else {
          return null;
        }
      } else if (curTokens.length === 2) {
        const dVal = VI_UNITS[curTokens[0]];
        const uVal = VI_UNITS[curTokens[1]];
        if (dVal !== undefined && dVal >= 2 && dVal <= 9 && uVal !== undefined) {
          tens = dVal * 10;
          units = uVal;
        } else {
          return null;
        }
      } else if (curTokens.length === 1 && VI_UNITS[curTokens[0]] !== undefined) {
        units = VI_UNITS[curTokens[0]];
      } else {
        return null;
      }
    }
  }

  return thousands + hundreds + tens + units;
}

export function viNumberWords(text) {
  if (typeof text === 'number') {
    return numberToViWords(text);
  }
  if (!text || typeof text !== 'string') return text;

  const protectedMatches = [];
  let safeText = text;
  PROTECTED_PHRASES.forEach((phrase) => {
    const reg = new RegExp(`(?<!\\p{L})${phrase}(?!\\p{L})`, 'giu');
    safeText = safeText.replace(reg, (match) => {
      const key = `__PROT_${protectedMatches.length}__`;
      protectedMatches.push({ key, original: match });
      return key;
    });
  });

  let converted = safeText.replace(VI_WORD_REGEX, (match) => {
    const parsed = parseViNumberPhrase(match);
    return parsed !== null ? String(parsed) : match;
  });

  protectedMatches.forEach(({ key, original }) => {
    converted = converted.replace(new RegExp(key, 'g'), original);
  });

  return converted;
}

export function numberToViWords(n) {
  if (typeof n !== 'number' || isNaN(n)) return '';
  n = Math.floor(n);
  if (n < 0 || n > 10000) return String(n);
  if (n === 10000) return 'mười nghìn';
  if (n === 0) return 'không';

  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  let res = [];

  const thousands = Math.floor(n / 1000);
  const remainder1 = n % 1000;
  if (thousands > 0) {
    res.push(digits[thousands] + ' nghìn');
  }

  const hundreds = Math.floor(remainder1 / 100);
  const remainder2 = remainder1 % 100;
  if (hundreds > 0 || (thousands > 0 && remainder2 > 0)) {
    res.push(digits[hundreds] + ' trăm');
  }

  const tens = Math.floor(remainder2 / 10);
  const units = remainder2 % 10;

  if (tens > 1) {
    res.push(digits[tens] + ' mươi');
    if (units === 1) res.push('mốt');
    else if (units === 4) res.push('tư');
    else if (units === 5) res.push('lăm');
    else if (units > 0) res.push(digits[units]);
  } else if (tens === 1) {
    res.push('mười');
    if (units === 5) res.push('lăm');
    else if (units > 0) res.push(digits[units]);
  } else if (tens === 0 && (thousands > 0 || hundreds > 0) && units > 0) {
    res.push('linh ' + (units === 4 ? 'tư' : digits[units]));
  } else if (tens === 0 && units > 0) {
    res.push(units === 4 ? 'tư' : digits[units]);
  }

  return res.join(' ');
}

viNumberWords.parse = parseViNumberPhrase;
viNumberWords.toWords = numberToViWords;

export function extractNumbers(input) {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.flatMap(extractNumbers);
  }
  const str = String(input);
  const normalized = viNumberWords(str);
  const nums = new Set();
  (normalized.match(/\b\d+\b/g) || []).forEach((n) => nums.add(Number(n)));

  // Bắt các dạng số kèm đơn vị chữ trong tiếng Việt: "3 chục", "2 trăm", "1 tá"
  const chucRegex = /(\d+)\s*(?:chục|mươi)/gi;
  let m;
  while ((m = chucRegex.exec(str)) !== null) {
    const val = Number(m[1]);
    nums.add(val * 10);
    nums.add(val);
  }
  if (/(?:^|[^\d\p{L}])chục(?!\p{L})/iu.test(str)) nums.add(10);

  const tramRegex = /(\d+)\s*trăm/gi;
  while ((m = tramRegex.exec(str)) !== null) {
    const val = Number(m[1]);
    nums.add(val * 100);
    nums.add(val);
  }
  const nghinRegex = /(\d+)\s*(?:nghìn|ngàn)/gi;
  while ((m = nghinRegex.exec(str)) !== null) {
    const val = Number(m[1]);
    nums.add(val * 1000);
    nums.add(val);
  }
  if (/(?:^|[^\p{L}])tá(?!\p{L})/iu.test(str)) nums.add(12);

  return [...nums];
}

export const GUARD_RULES = {
  p3_explain: {
    answer: ["dap_an_cuoi_cho_me", "cac_bac[].dap_an_cho_me"],
    child: ["cac_bac[].cau_hoi", "cac_bac[].goi_y.*", "loi_khen", "cac_bac[].ly_do_cho_me"],
    allowedFrom: ["problem_text"],
  },
  p3_explain_v2: {
    answer: ['dap_an_cuoi_cho_me', 'cac_bac[].dap_an_cho_me'],
    child: ['cac_bac[].cau_hoi', 'cac_bac[].goi_y.*', 'loi_khen', 'cac_bac[].ly_do_cho_me'],
    allowedFrom: ['problem_text'],
  },
  p14b_check_work: {
    answer: ['dap_an_dung_cho_me', 'gia_tri_dung_dong_sai'],
    child: ['cau_hoi_cho_con.muc_1', 'cau_hoi_cho_con.muc_2', 'loi_khen_cu_the'],
    allowedFrom: ['problem_text', 'child_lines'],
  },
  p14d_teach_back: {
    answer: ['dap_an_cuoi_cho_me', 'cac_bac[].dap_an_cho_me'],
    child: ['cau_hoi_them', 'loi_khen_cho_con'],
    allowedFrom: ['problem_text', 'transcript'],
  },
  p4_chat: {
    answer: ['dap_an'],
    child: ['cau_tra_loi', 'goi_y'],
    allowedFrom: ['problem_text'],
  },
  p6_practice: {
    answer: ['dap_an_cho_me'],
    child: ['cau_hoi', 'huong_dan'],
    allowedFrom: ['problem_text'],
  },
  p8_calm_phrase: {
    answer: [],
    child: ['cau_an_ui'],
    allowedFrom: [],
  },
};

export const DEFAULT_GUARD_FALLBACKS = {
  'cac_bac[].cau_hoi': 'Con thử nói cách làm bước này nhé?',
  'cac_bac[].goi_y.muc_1_do_vat': 'Con đếm xem có bao nhiêu nhóm đồ vật nào?',
  'cac_bac[].goi_y.muc_2_hinh_ve': 'Vẽ sơ đồ đoạn thẳng để dễ nhìn hơn nhé.',
  'cac_bac[].ly_do_cho_me': 'Hỏi gợi mở để con tự khám phá cách làm.',
  'loi_khen': 'Con làm rất tốt, cùng tiếp tục nào!',
  'cau_hoi_cho_con.muc_1': 'Con thử tính lại dòng này theo cách của con nhé?',
  'cau_hoi_cho_con.muc_2': 'Con dùng que tính hoặc kẹo để kiểm tra lại nhé.',
  'loi_khen_cu_the': 'Dòng đầu tiên con trình bày rất cẩn thận.',
  'cau_hoi_them': 'Vì sao con lại làm phép tính này hả con?',
  'loi_khen_cho_con': 'Con kể lại rất rõ ràng, mẹ rất vui!',
  'default': 'Con thử tự suy nghĩ và giải thích cho mẹ nghe nhé?',
};

function getFieldValues(obj, path) {
  if (!obj || typeof obj !== 'object') return [];
  const results = [];

  function traverse(cur, segments, curPath) {
    if (cur === null || cur === undefined) return;
    if (segments.length === 0) {
      if (typeof cur === 'string' || typeof cur === 'number') {
        results.push({ value: String(cur), path: curPath, parent: null, key: '' });
      }
      return;
    }

    const [head, ...tail] = segments;

    if (head.endsWith('[]')) {
      const prop = head.slice(0, -2);
      const arr = prop ? cur[prop] : cur;
      if (Array.isArray(arr)) {
        arr.forEach((item, idx) => {
          traverse(item, tail, `${curPath}${prop ? '.' + prop : ''}[${idx}]`);
        });
      }
    } else if (head === '*') {
      if (typeof cur === 'object') {
        Object.keys(cur).forEach((k) => {
          traverse(cur[k], tail, `${curPath}.${k}`);
        });
      }
    } else {
      if (tail.length === 0) {
        if (cur[head] !== undefined) {
          results.push({ value: String(cur[head]), path: `${curPath}.${head}`, parent: cur, key: head });
        }
      } else {
        traverse(cur[head], tail, `${curPath}.${head}`);
      }
    }
  }

  traverse(obj, path.split('.'), '');
  return results;
}

export function checkAnswerLeak(promptId, data, context = {}) {
  // Đợt 18 · Chặng 0.4: Bộ chặn cho p3_explain / p3_explain_v2 sửa đúng bậc, bớt bắt nhầm
  if (promptId === "p3_explain" || promptId === "p3_explain_v2") {
    const problemText = String(context.problem_text || "");
    const allowedNumbers = new Set(extractNumbers(problemText));
    const problemLower = problemText.toLowerCase();

    const finalAnsNumbers = new Set(
      extractNumbers(data.dap_an_cuoi_cho_me || "").filter((n) => !allowedNumbers.has(n))
    );

    const steps = Array.isArray(data.cac_bac) ? data.cac_bac : Array.isArray(data.steps) ? data.steps : [];
    
    // Cụm từ đáp án ngắn (2-4 từ)
    const answerPhrases = [];
    [data.dap_an_cuoi_cho_me, ...(steps.map(s => s?.dap_an_cho_me || s?.answerForParent))].forEach(v => {
      const trimmed = String(v || "").trim().toLowerCase();
      const words = trimmed.split(/\s+/);
      if (words.length >= 2 && words.length <= 4 && !/^\d+$/.test(words[0])) {
        if (!problemLower.includes(trimmed)) {
          answerPhrases.push(trimmed);
        }
      }
    });

    let leaked = false;
    const leakReasons = [];
    const leaks = [];

    steps.forEach((step, idx) => {
      if (!step || typeof step !== "object") return;
      const stepNo = idx + 1;
      const kyNang = step.ky_nang || null;

      const stepAnsText = step.dap_an_cho_me || step.answerForParent || "";
      const stepAnsNumbers = new Set(
        extractNumbers(stepAnsText).filter((n) => !allowedNumbers.has(n))
      );
      // Chỉ coi là lộ đáp án khi cau_hoi hoặc goi_y chứa đáp số cuối HOẶC kết quả của chính bậc đó
      const forbiddenForStep = new Set([...finalAnsNumbers, ...stepAnsNumbers]);

      const qText = step.cau_hoi || step.questionForChild || "";
      if (qText) {
        const normQ = viNumberWords(String(qText));
        forbiddenForStep.forEach((ansNum) => {
          const reg = new RegExp(`\\b${ansNum}\\b`);
          if (reg.test(normQ)) {
            leaked = true;
            leakReasons.push(`Bậc ${stepNo} lộ số đáp án ${ansNum} trong câu hỏi`);
            leaks.push({
              field: "cac_bac[].cau_hoi",
              path: `cac_bac[${idx}].cau_hoi`,
              parent: step,
              key: step.cau_hoi !== undefined ? "cau_hoi" : "questionForChild",
              step_idx: idx,
              step_no: stepNo,
              ky_nang: kyNang,
              illegalValue: String(ansNum),
              beforeText: qText,
            });
          }
        });

        answerPhrases.forEach((phrase) => {
          if (normQ.toLowerCase().includes(phrase)) {
            leaked = true;
            leakReasons.push(`Bậc ${stepNo} lộ cụm từ đáp án "${phrase}" trong câu hỏi`);
            leaks.push({
              field: "cac_bac[].cau_hoi",
              path: `cac_bac[${idx}].cau_hoi`,
              parent: step,
              key: step.cau_hoi !== undefined ? "cau_hoi" : "questionForChild",
              step_idx: idx,
              step_no: stepNo,
              ky_nang: kyNang,
              illegalValue: phrase,
              beforeText: qText,
            });
          }
        });
      }

      const h1Text = step.goi_y?.muc_1_do_vat || step.hintLevel1 || "";
      if (h1Text) {
        const normH1 = viNumberWords(String(h1Text));
        forbiddenForStep.forEach((ansNum) => {
          const reg = new RegExp(`\\b${ansNum}\\b`);
          if (reg.test(normH1)) {
            leaked = true;
            leakReasons.push(`Bậc ${stepNo} lộ số đáp án ${ansNum} trong gợi ý 1`);
            leaks.push({
              field: "cac_bac[].goi_y.muc_1_do_vat",
              path: `cac_bac[${idx}].goi_y.muc_1_do_vat`,
              parent: step.goi_y || step,
              key: step.goi_y ? "muc_1_do_vat" : "hintLevel1",
              step_idx: idx,
              step_no: stepNo,
              ky_nang: kyNang,
              illegalValue: String(ansNum),
              beforeText: h1Text,
            });
          }
        });
      }

      const h2Text = step.goi_y?.muc_2_hinh_ve || step.hintLevel2 || "";
      if (h2Text) {
        const normH2 = viNumberWords(String(h2Text));
        forbiddenForStep.forEach((ansNum) => {
          const reg = new RegExp(`\\b${ansNum}\\b`);
          if (reg.test(normH2)) {
            leaked = true;
            leakReasons.push(`Bậc ${stepNo} lộ số đáp án ${ansNum} trong gợi ý 2`);
            leaks.push({
              field: "cac_bac[].goi_y.muc_2_hinh_ve",
              path: `cac_bac[${idx}].goi_y.muc_2_hinh_ve`,
              parent: step.goi_y || step,
              key: step.goi_y ? "muc_2_hinh_ve" : "hintLevel2",
              step_idx: idx,
              step_no: stepNo,
              ky_nang: kyNang,
              illegalValue: String(ansNum),
              beforeText: h2Text,
            });
          }
        });
      }

      const lyDoText = step.ly_do_cho_me || "";
      if (lyDoText) {
        const normL = viNumberWords(String(lyDoText));
        forbiddenForStep.forEach((ansNum) => {
          const reg = new RegExp(`\\b${ansNum}\\b`);
          if (reg.test(normL)) {
            leaked = true;
            leakReasons.push(`Bậc ${stepNo} lộ số đáp án ${ansNum} trong lý do cho mẹ`);
            leaks.push({
              field: "cac_bac[].ly_do_cho_me",
              path: `cac_bac[${idx}].ly_do_cho_me`,
              parent: step,
              key: "ly_do_cho_me",
              step_idx: idx,
              step_no: stepNo,
              ky_nang: kyNang,
              illegalValue: String(ansNum),
              beforeText: lyDoText,
            });
          }
        });
      }
    });

    return { leaked, leakReasons, leaks };
  }

  const rule = GUARD_RULES[promptId];
  if (!rule) return { leaked: false, leakReasons: [], leaks: [] };

  const allowedNumbers = new Set();
  const allowedPhrases = [];

  rule.allowedFrom.forEach((srcKey) => {
    const srcVal = context[srcKey];
    if (srcVal) {
      extractNumbers(srcVal).forEach((num) => allowedNumbers.add(num));
      if (typeof srcVal === 'string') {
        allowedPhrases.push(srcVal.toLowerCase());
      } else if (Array.isArray(srcVal)) {
        srcVal.forEach(s => allowedPhrases.push(String(s).toLowerCase()));
      }
    }
  });

  const answerNumbers = new Set();
  const answerPhrases = [];

  rule.answer.forEach((ansPath) => {
    const vals = getFieldValues(data, ansPath);
    vals.forEach(({ value }) => {
      extractNumbers(value).forEach((num) => {
        if (!allowedNumbers.has(num)) {
          answerNumbers.add(num);
        }
      });

      const trimmed = value.trim().toLowerCase();
      const words = trimmed.split(/\s+/);
      if (words.length >= 2 && words.length <= 4 && !/^\d+$/.test(words[0])) {
        const alreadyInAllowed = allowedPhrases.some(p => p.includes(trimmed));
        if (!alreadyInAllowed) {
          answerPhrases.push(trimmed);
        }
      }
    });
  });

  if (answerNumbers.size === 0 && answerPhrases.length === 0) {
    return { leaked: false, leakReasons: [], leaks: [] };
  }

  let leaked = false;
  const leakReasons = [];
  const leaks = [];

  rule.child.forEach((childPattern) => {
    const childFields = getFieldValues(data, childPattern);
    childFields.forEach((item) => {
      const rawText = item.value;
      const normalizedText = viNumberWords(rawText);

      answerNumbers.forEach((ansNum) => {
        const numRegex = new RegExp(`\\b${ansNum}\\b`);
        if (numRegex.test(normalizedText)) {
          leaked = true;
          leakReasons.push(`Trường ${item.path || childPattern} lộ số đáp án ${ansNum}`);
          leaks.push({
            field: childPattern,
            path: item.path,
            parent: item.parent,
            key: item.key,
            illegalValue: String(ansNum),
            beforeText: rawText,
          });
        }
      });

      answerPhrases.forEach((phrase) => {
        if (normalizedText.toLowerCase().includes(phrase)) {
          leaked = true;
          leakReasons.push(`Trường ${item.path || childPattern} lộ cụm từ đáp án "${phrase}"`);
          leaks.push({
            field: childPattern,
            path: item.path,
            parent: item.parent,
            key: item.key,
            illegalValue: phrase,
            beforeText: rawText,
          });
        }
      });
    });
  });

  return { leaked, leakReasons, leaks };
}

export function validateAndGuard(promptId, responseText, context = {}, env = null, ctx = null) {
  if (!responseText) {
    return {
      response: responseText,
      guarded: false,
      validator: { status: 'Lỗi định dạng', detail: 'Phản hồi rỗng', timestamp: new Date().toISOString() },
    };
  }

  let jsonStr = responseText.trim();
  const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) jsonStr = match[1];

  let data;
  try {
    data = JSON.parse(jsonStr);
  } catch (err) {
    return {
      response: responseText,
      guarded: true,
      error_code: 'AI_FORMAT',
      validator: {
        status: 'Lỗi định dạng',
        detail: 'Phản hồi không phải JSON hợp lệ: ' + (err?.message || ''),
        timestamp: new Date().toISOString(),
      },
    };
  }

  if (promptId === 'p3_explain') {
    if (!Array.isArray(data.cac_bac) || data.cac_bac.length < 3) {
      return {
        response: responseText,
        guarded: true,
        error_code: 'AI_FORMAT',
        validator: {
          status: 'Lỗi định dạng',
          detail: 'Thiếu các bậc gợi mở (yêu cầu từ 3 bậc trở lên)',
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  const check = checkAnswerLeak(promptId, data, context);

  if (!check.leaked) {
    return {
      response: JSON.stringify(data, null, 2),
      data,
      guarded: false,
      validator: {
        status: 'Đạt',
        detail: 'Không phát hiện rò rỉ đáp án',
        timestamp: new Date().toISOString(),
      },
    };
  }

  const fallbacks = DEFAULT_GUARD_FALLBACKS;

  check.leaks.forEach((leak) => {
    let fallbackText = '';
    if (leak.key === 'cau_hoi' || leak.key === 'questionForChild') {
      if (leak.ky_nang && SKILL_SAFE_QUESTIONS[leak.ky_nang]) {
        fallbackText = SKILL_SAFE_QUESTIONS[leak.ky_nang];
      } else {
        fallbackText = DEFAULT_GUARD_FALLBACKS['cac_bac[].cau_hoi'] || DEFAULT_GUARD_FALLBACKS.default;
      }
    } else if (leak.key === 'muc_1_do_vat' || leak.key === 'hintLevel1') {
      fallbackText = DEFAULT_GUARD_FALLBACKS['cac_bac[].goi_y.muc_1_do_vat'] || 'Con đếm xem có bao nhiêu nhóm đồ vật nào?';
    } else if (leak.key === 'muc_2_hinh_ve' || leak.key === 'hintLevel2') {
      fallbackText = DEFAULT_GUARD_FALLBACKS['cac_bac[].goi_y.muc_2_hinh_ve'] || 'Vẽ sơ đồ đoạn thẳng để dễ nhìn hơn nhé.';
    } else if (leak.key === 'ly_do_cho_me') {
      fallbackText = DEFAULT_GUARD_FALLBACKS['cac_bac[].ly_do_cho_me'] || 'Hỏi gợi mở để con tự khám phá cách làm.';
    } else {
      fallbackText = fallbacks[leak.field] || fallbacks[leak.path] || fallbacks['default'];
    }
    if (leak.parent && leak.key) {
      leak.parent[leak.key] = fallbackText;
    }
  });

  return {
    response: JSON.stringify(data, null, 2),
    data,
    guarded: true,
    validator: {
      status: 'Đã chặn',
      detail: check.leakReasons.join('; '),
      timestamp: new Date().toISOString(),
    },
  };
}
