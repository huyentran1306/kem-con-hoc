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
  const matches = normalized.match(/\b\d+\b/g) || [];
  return [...new Set(matches.map(Number))];
}

export const GUARD_RULES = {
  p3_explain: {
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
    const fallbackText = fallbacks[leak.field] || fallbacks[leak.path] || fallbacks['default'];
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
