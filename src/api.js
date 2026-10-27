import { validateAllLessonMath, correctLessonMath } from './arithmetic.js';

let memoryDemoMode = false;
export function isDemoMode() {
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem("kch_demo_mode") === "true";
    }
    return memoryDemoMode;
  } catch (_) {
    return memoryDemoMode;
  }
}

export function setDemoMode(val) {
  memoryDemoMode = Boolean(val);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("kch_demo_mode", val ? "true" : "false");
    }
  } catch (_) {}
}

/* ============================================================
   CLIENT GATEWAY — API Service & Database Bridge
   ============================================================ */
import { PROBLEM } from './data.js'
import { renderPrompt, getActiveAiConfig, classifyProblemDynamic } from './promptStudio.js'
import { getWeekLabel } from './utils.js'
import { parseOcrV2Result, evaluateTextScope, DEFAULT_SCOPE_RULES, SCOPE_RULES_KV_KEY, parseGradeNum } from './scopeRules.js'
import { viNumberWords } from './guard.js'
import { isTrialActive, matchTrialLesson, PRELOADED_TRIAL_LESSONS, getTrialInitialState, trialLessonToProblem, setActiveTrialLesson, getActiveTrialLesson, TRIAL_LESSON_EXTRAS, TRIAL_LIMIT_MESSAGE } from './trialData.js'

export const GATEWAY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_GATEWAY) || 'https://ai-gateway-worker.trannth1306.workers.dev'
export const AI_GATEWAY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AI_GATEWAY) || 'https://ai-gateway-worker.trannth1306.workers.dev'
export const CLOUD_KEY = 'kem-con-hoc:state'
export const famCloudKey = (id) => (id ? `fam:${id}:state` : 'kem-con-hoc:state')
export const AUTH_STORAGE_KEY = 'kem-con-hoc:auth'

/* ---------- Quản lý Auth Token ---------- */
export function getAuthToken() {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

export function setAuthToken(token) {
  try {
    if (token) localStorage.setItem(AUTH_STORAGE_KEY, token)
    else localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {}
}

export function removeAuthToken() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {}
}

export function getAdminToken() {
  // Đợt 15: token phiên quản trị do máy chủ cấp (khoá mới, xem src/adminApi.js)
  try {
    return localStorage.getItem('kem-con-hoc:admin-token') || ''
  } catch {}
  return ''
}

async function post(path, body, timeoutMs = 25000, baseUrl = GATEWAY, extraHeaders = {}) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  const token = getAdminToken() || getAuthToken()
  const safeHeaders = { 'Content-Type': 'application/json' }
  if (extraHeaders && typeof extraHeaders === 'object') {
    for (const [k, v] of Object.entries(extraHeaders)) {
      if (v != null) {
        const strVal = String(v)
        safeHeaders[k] = Array.from(strVal).some((c) => c.charCodeAt(0) > 255) ? encodeURIComponent(strVal) : strVal
      }
    }
  }
  if (token && !safeHeaders['Authorization']) {
    safeHeaders['Authorization'] = `Bearer ${token}`
  }
  try {
    const r = await fetch(baseUrl + path, {
      method: 'POST',
      headers: safeHeaders,
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) {
      const err = new Error(data.error?.message || 'HTTP ' + r.status)
      err.status = r.status
      err.data = data
      throw err
    }
    return data
  } finally {
    clearTimeout(t)
  }
}

async function postAi(path, body, timeoutMs = 25000, extraHeaders = {}) {
  return post(path, body, timeoutMs, AI_GATEWAY, extraHeaders)
}

/* Lấy JSON từ response (gateway có thể trả object hoặc chuỗi) */
export function extractJson(raw) {
  if (raw && typeof raw === 'object') return raw
  let text = String(raw || '').trim()
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) return null
  try {
    return JSON.parse(m[0])
  } catch (e) {
    return null
  }
}

/* ============================================================
   🔍 OCR — đọc chữ từ ảnh chụp bài tập (multipart → /vision/ocr & /vision/analyze)
   Hỗ trợ p1_ocr_v3/v2 gộp phân loại phạm vi (bài tập, nhạy cảm, đồ chơi, ảnh mờ, nhiều bài)
   ============================================================ */
export async function aiOcr(file, timeoutMs = 25000, context = {}) {
  if (isTrialActive()) {
    return {
      text: PRELOADED_TRIAL_LESSONS[0].de_bai,
      scopeResult: { action: 'allow', category: 'hop_le', confidence: 0.99 },
      raw: PRELOADED_TRIAL_LESSONS[0].de_bai,
    }
  }
  // Mỗi tầng có timeout riêng: tầng 1 chậm không được "ăn" hết thời gian của tầng dự phòng
  const postWithTimeout = async (url, body, ms) => {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), ms)
    try {
      return await fetch(url, { method: 'POST', body, signal: ctrl.signal })
    } finally {
      clearTimeout(timer)
    }
  }

  // Ưu tiên p1_ocr_v3 (chép nguyên văn, tách bài làm của con, đánh dấu [?]) → v2 → v1
  const ocrPrompt = renderPrompt('p1_ocr_v3') || renderPrompt('p1_ocr_v2') || renderPrompt('p1_ocr')

  // Tầng 1: model vision qua /vision/analyze
  try {
    const fd = new FormData()
    fd.append('image', file, 'homework.jpg')
    // Worker mới lấy prompt phía máy chủ theo prompt_id; 'prompt' chỉ để worker cũ còn chạy
    fd.append('prompt_id', 'p1_ocr_v3')
    fd.append('prompt', ocrPrompt)
    const rVision = await postWithTimeout(AI_GATEWAY + '/vision/analyze', fd, timeoutMs)
    if (rVision.ok) {
      const jv = await rVision.json()
      let analysis = jv.analysis || ''
      if (analysis && typeof analysis === 'object') analysis = JSON.stringify(analysis)
      analysis = String(analysis)
        .replace(/^Được rồi,.*?:\s*/i, '')
        .replace(/^\*\*ĐỀ BÀI:\*\*\s*/i, '')
        .replace(/^Đề bài toán tiểu học là:\s*/i, '')
        .replace(/Tôi hy vọng điều đó.*$/is, '')
        .trim()
      if (analysis.length >= 3) {
        const scope = parseOcrV2Result(analysis, context)
        // JSON hợp lệ → chỉ lấy de_bai (rỗng = không đọc được), không bao giờ trả JSON thô làm đề
        const text = scope.fromJson ? (scope.de_bai || '').trim() : (scope.de_bai || analysis).trim()
        return { text, scopeResult: scope, raw: analysis, structured: !!scope.fromJson }
      }
    }
  } catch (eVision) {
    console.warn('Vision analyze failed, fallback /vision/ocr:', eVision)
  }

  // Tầng 2: OCR thô (yếu với tiếng Việt viết tay) — sẽ được p2_clean làm sạch ở bước sau
  try {
    const fdOcr = new FormData()
    fdOcr.append('image', file, 'homework.jpg')
    const r = await postWithTimeout(AI_GATEWAY + '/vision/ocr', fdOcr, 10000)
    if (r.ok) {
      const j = await r.json()
      const text = j.extracted_text || null
      if (text && !text.includes('There is no text') && text.length >= 4 && !text.includes('The image shows')) {
        const cleanText = text.trim()
        const scope = parseOcrV2Result(cleanText, context)
        return {
          text: scope.de_bai || cleanText,
          scopeResult: scope,
          raw: cleanText,
          structured: false,
        }
      }
    }
  } catch (e) {
    console.warn('Vision OCR fallback failed:', e)
  }

  return null
}

/* ============================================================
   🎙️ SPEECH TO TEXT (STT) — Chuyển giọng nói thành văn bản
   Dùng OpenAI Whisper qua Cloudflare AI Gateway
   ============================================================ */
export async function aiSpeechToText(audioBlob, timeoutMs = 15000) {
  if (!audioBlob) return null
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const r = await fetch(AI_GATEWAY + '/stt', {
      method: 'POST',
      headers: { 'Content-Type': audioBlob.type || 'audio/webm' },
      body: audioBlob,
      signal: ctrl.signal,
    })
    if (!r.ok) return null
    const j = await r.json()
    return j.text ? j.text.trim() : null
  } catch (e) {
    console.warn('STT Gateway failed:', e)
    return null
  } finally {
    clearTimeout(timer)
  }
}


/* ============================================================
   🧸 AI VISION — Nhận diện đồ chơi / đồ vật trong nhà từ ảnh chụp
   ============================================================ */
export async function aiAnalyzeToy(blobOrFile, timeoutMs = 12000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const fd = new FormData()
    fd.append('image', blobOrFile, 'toy.jpg')
    fd.append('prompt_id', 'p5_toy')
    fd.append('prompt', renderPrompt('p5_toy'))
    const r = await fetch(AI_GATEWAY + '/vision/analyze', {
      method: 'POST',
      body: fd,
      signal: ctrl.signal,
    })
    if (!r.ok) return null
    const j = await r.json()
    return j.analysis || null
  } catch (e) {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/* ============================================================
   ✂️ AI TRÍCH ĐỀ — lọc đúng đề bài từ text OCR lẫn mô tả
   ============================================================ */
export function needsCleanProblem(rawText, confidence = 1) {
  if (!rawText || !rawText.trim()) return false
  if (confidence < 0.7) return true
  const text = rawText.trim()
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length === 0) return false

  // Đợt 20 Chặng 1.3: Chỉ làm sạch khi ký tự lạ > 3 hoặc có từ dính dài > 25 ký tự
  const strangeChars = (text.match(/[^a-zA-Z0-9àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ\s.,!?:;'"()/\-–—+%×÷=<>]/g) || []).length
  if (strangeChars > 3) return true

  const joinedWords = words.filter(w => w.length > 25)
  if (joinedWords.length > 0) return true

  return false
}

export async function aiExtractProblem(rawOcr, confidence = 1) {
  if (isTrialActive()) return rawOcr || PRELOADED_TRIAL_LESSONS[0].de_bai
  if (!rawOcr || !rawOcr.trim()) return null
  // Bỏ lần làm sạch thừa: nếu đề đã rõ ràng, trả luôn nguyên văn không gọi AI
  if (!needsCleanProblem(rawOcr, confidence)) {
    return rawOcr.trim()
  }
  const sys = renderPrompt('p2_clean')
  return aiChat(sys, [], rawOcr)
}

/* ============================================================
   🧭 BỘ ĐỊNH TUYẾN PHÂN LOẠI NHANH (Fast Classifier Router)
   Xác định môn, dạng bài, lỗi hay gặp để chèn phương pháp chuẩn
   ============================================================ */
export function fastClassifyProblem(deBai = '', lop = 'Lớp 2') {
  return classifyProblemDynamic(deBai, lop)
}

/* ============================================================
   🧠 AI GIẢNG BÀI — Scaffold Socratic theo Router phương pháp
   Hỗ trợ 4 bậc câu hỏi, mức 1 vật thật, mức 2 hình vẽ, bài anh em & 5p game
   ============================================================ */
export async function aiExplain(ocr, child, tone, parentNote = '', isStuck = false, options = {}) {
  if (isTrialActive()) {
    // Đợt 15 P1: Dùng thử chỉ có 3 đề mẫu, đề khác thì nói rõ (không trả bài vịt cho mọi đề)
    const trial = matchTrialLesson(ocr)
    if (!trial) return { error: 'trial_limit', message: TRIAL_LIMIT_MESSAGE }
    setActiveTrialLesson(trial.id)
    await new Promise((r) => setTimeout(r, 500))
    return trialLessonToProblem(trial)
  }
  const grade = child?.grade || 'Lớp 2'
  const book = child?.book || 'Kết nối tri thức'
  const classification = fastClassifyProblem(ocr, grade)

  // Đợt 18 · Chặng 0.3: Mặc định bật p3_explain_v2 trên mọi môi trường (kể cả production)
  const aiCfg = getActiveAiConfig();
  const useV1 = aiCfg?.prompt_version === 'v1' || aiCfg?.p3_version === 'v1';
  const targetPromptId = useV1 ? 'p3_explain' : 'p3_explain_v2';

  const learnerProfile = options.learnerProfile || child?.learnerProfile || null
  const hoSoConText = (child?.bearMemory !== false && learnerProfile?.profile) ? learnerProfile.profile : 'chưa có'

  const sys = renderPrompt(targetPromptId, {
    mon: classification.mon,
    lop: grade,
    sach: book,
    bo_sach: book,
    dang_bai: classification.dang_bai,
    loi_hay_gap: classification.loi_hay_gap,
    giong: tone || 'Dịu dàng',
    de_bai: ocr,
    ghi_chu: parentNote,
    isStuck,
    ho_so_con: hoSoConText,
  })

  const isValidExplain = (d) => {
    if (!d || typeof d !== 'object') return false
    if (d.can_hoi_lai && String(d.can_hoi_lai).trim()) return true
    if (Array.isArray(d.cac_bac) && d.cac_bac.length >= 3 && d.cac_bac[0]?.cau_hoi) return true
    if (Array.isArray(d.steps) && d.steps.length >= 3 && (d.steps[0]?.question || d.steps[0]?.q)) return true
    return false
  }

  const userPrompt = `Soạn bài cho đề sau theo đúng schema. Chỉ trả JSON.\nĐề bài: """${ocr}"""`

  // P0.A: soạn bài có thể mất 20–40 giây; hạn chờ riêng 75 giây, không coi là "mạng chậm"
  const EXPLAIN_TIMEOUT_MS = Math.max(75000, Number(aiCfg.timeout_ms) || 0)
  const startedAt = Date.now()
  const modelId = typeof aiCfg.model === 'string' && aiCfg.model.startsWith('@cf/') ? aiCfg.model : undefined

  try {
    let j;
    // Đợt 20 · Chặng 2: Chế độ trình diễn - nếu quá 10s tự động chuyển bản soạn sẵn
    if (isDemoMode()) {
      try {
        const demoTimeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("demo_safeguard_10s_timeout")), 10000)
        );
        const aiPromise = postAi(
          '/chat',
          {
            messages: [
              { role: 'system', content: sys },
              { role: 'user', content: userPrompt },
            ],
            max_tokens: Math.min(Number(aiCfg.max_tokens) || 1400, 1600),
            temperature: typeof aiCfg.temperature === 'number' ? aiCfg.temperature : 0.3,
            model: modelId,
          },
          10000,
          { 'X-Prompt-Id': targetPromptId, 'X-Problem-Text': encodeURIComponent(ocr || ''), 'X-Family-Id': encodeURIComponent(options.familyId || '') }
        );
        j = await Promise.race([aiPromise, demoTimeoutPromise]);
      } catch (dErr) {
        console.warn("Chế độ trình diễn: Quá 10s hoặc lỗi mạng, mở bản soạn sẵn:", dErr);
        const matched = matchTrialLesson(ocr) || PRELOADED_TRIAL_LESSONS[0];
        const p = trialLessonToProblem(matched);
        p.is_preloaded_demo = true;
        p.demo_timestamp = localStorage.getItem("kch_demo_preload_time") || "19:42";
        return p;
      }
    } else {
      j = await postAi(
        '/chat',
        {
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: Math.min(Number(aiCfg.max_tokens) || 1400, 1600),
          temperature: typeof aiCfg.temperature === 'number' ? aiCfg.temperature : 0.3,
          model: modelId,
        },
        EXPLAIN_TIMEOUT_MS,
        { 'X-Prompt-Id': targetPromptId, 'X-Problem-Text': encodeURIComponent(ocr || ''), 'X-Family-Id': encodeURIComponent(options.familyId || '') }
      );
    }
    let data = extractJson(j.response ?? j)

    // Lần đầu lỗi JSON hoặc thiếu schema: thử lại 1 lần nếu còn đủ thời gian
    const remainingMs = EXPLAIN_TIMEOUT_MS - (Date.now() - startedAt)
    if (!isValidExplain(data) && remainingMs > 20000) {
      const retryResp = await postAi(
        '/chat',
        {
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: userPrompt },
            { role: 'assistant', content: String(j?.response || '') },
            { role: 'user', content: 'Trả lại đúng JSON theo schema, không thêm chữ.' },
          ],
          max_tokens: 1400,
          temperature: 0.2,
          model: modelId,
        },
        remainingMs,
        { 'X-Prompt-Id': targetPromptId, 'X-Problem-Text': encodeURIComponent(ocr || ''), 'X-Family-Id': encodeURIComponent(options.familyId || '') }
      )
      data = extractJson(retryResp.response ?? retryResp)
    }

    if (!isValidExplain(data)) {
      return {
        error: 'format_error',
        message: 'AI trả lời chưa đúng định dạng, mẹ thử lại nhé',
      }
    }

    // Đợt 18 · Chặng 1: Máy kiểm phép tính tự động rà soát và sửa sai nếu có
    let mathCheck = validateAllLessonMath(data)
    if (mathCheck.hasError) {
      const corrected = correctLessonMath(data)
      data = corrected.lessonData
      mathCheck = validateAllLessonMath(data)
    }

    // Chuẩn hóa bậc câu hỏi (hỗ trợ cả cac_bac schema Socratic mới và steps schema cũ)
    let rawSteps = []
    if (Array.isArray(data.cac_bac) && data.cac_bac.length > 0) {
      rawSteps = data.cac_bac.map((b, idx) => ({
        question: b.cau_hoi || `Bậc ${idx + 1}`,
        ky_nang: b.ky_nang || 'tinh_toan',
        ly_do_cho_me: b.ly_do_cho_me || '',
        answerForParent: b.dap_an_cho_me || '',
        answer: b.dap_an_cho_me || '',
        hint: b.goi_y?.muc_1_do_vat || (typeof b.goi_y === 'string' ? b.goi_y : ''),
        hint2: b.goi_y?.muc_2_hinh_ve || '',
        loi_khen: b.loi_khen || '',
        praise: b.loi_khen || data.loi_khen || 'Con rất nỗ lực!',
      }))
    } else if (Array.isArray(data.steps) && data.steps.length > 0) {
      rawSteps = data.steps.map((s) => ({
        question: s.question || s.q || '',
        ly_do_cho_me: s.ly_do_cho_me || '',
        answerForParent: s.answerForParent || s.answer || '',
        answer: s.answer || '',
        hint: s.hint || '',
        hint2: s.hint2 || '',
        praise: s.praise || '',
      }))
    }

    return {
      id: 'ai-' + Date.now(),
      type: data.dang_bai || data.type || classification.dang_bai,
      summary: data.giai_thich_cho_me || data.summary || '',
      warning: data.luu_y_khi_giang || data.warning || '',
      method: data.method || 'Singapore CPA + Socratic',
      ocr: data.ocr || ocr,
      steps: rawSteps.slice(0, 4),
      answer: data.dap_an_cuoi_cho_me || data.answer || '',
      brotherProblem: data.bai_anh_em || null,
      teachBack: data.con_day_lai_me || '',
      fiveMinGame: data.tro_choi_5_phut || '',
      praise: data.loi_khen || '',
      needReAsk: data.can_hoi_lai || '',
      answerLine: '',
      diagram: null,
    }
  } catch (e) {
    // Phân biệt: lỗi mã nguồn (ReferenceError, TypeError,...) không che giấu dưới dạng lỗi mạng
    if (e instanceof ReferenceError || e instanceof TypeError || e instanceof RangeError || e instanceof SyntaxError) {
      console.error('Lỗi mã nguồn trong xử lý bài giảng:', e);
      return { error: 'runtime_error', message: 'Lỗi xử lý bài giảng: ' + (e?.message || e) };
    }
    // Phân biệt: hết hạn chờ (AI soạn lâu) / máy chủ báo lỗi / mất mạng thật
    if (e && e.name === 'AbortError') return { error: 'timeout', message: 'AI đang soạn lâu hơn thường lệ' };
    if (e && e.status) return { error: 'server', status: e.status, message: e.message };
    return { error: 'network', message: 'Không kết nối được máy chủ' };
  }
}

/* ============================================================
   🧠 AI CHAT — Hỏi thêm (chỉ cho cha mẹ, không đáp án)
   ============================================================ */
export async function aiChat(system, history, question) {
  try {
    const messages = [{ role: 'system', content: system }]
    history.forEach((m) => messages.push({ role: m.from === 'u' ? 'user' : 'assistant', content: m.text }))
    messages.push({ role: 'user', content: question })
    const j = await postAi('/chat', { messages, max_tokens: 600, temperature: 0.5 })
    const resp = j.response
    if (typeof resp === 'string' && resp.trim()) return resp.trim()
    return null
  } catch (e) {
    return null
  }
}

/* ============================================================
   ✏️ AI TẠO BÀI LUYỆN THÊM (cùng dạng, số khác)
   ============================================================ */
export async function aiPractice(problem, child) {
  const sys = renderPrompt('p6_practice', {
    lop: child.grade || 'Lớp 2',
    sach: child.book || 'Kết nối tri thức',
    de_bai: problem.ocr,
  })
  try {
    const j = await postAi('/chat', {
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: 'Tạo bài luyện thêm' },
      ],
      max_tokens: 400,
      temperature: 0.6,
    })
    const data = extractJson(j.response ?? j)
    if (!data || !data.text) return null
    return { text: data.text, answer: data.answer || '' }
  } catch (e) {
    return null
  }
}

/* ============================================================
   💾 D1 DATABASE — Key-Value (đồng bộ state lên đám mây)
   ============================================================ */
export async function dbKvGet(key) {
  try {
    const token = getAdminToken() || getAuthToken()
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const r = await fetch(GATEWAY + '/db/kv/' + encodeURIComponent(key), { headers })
    if (!r.ok) return null
    const j = await r.json()
    return j.found ? j.value : null
  } catch (e) {
    return null
  }
}

export async function dbKvSet(key, value) {
  try {
    const token = getAdminToken() || getAuthToken()
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    const r = await fetch(GATEWAY + '/db/kv/' + encodeURIComponent(key), {
      method: 'POST',
      headers,
      body: JSON.stringify({ value }),
    })
    return r.ok
  } catch (e) {
    return false
  }
}

/* ============================================================
   👨‍👩‍👧 TÀI KHOẢN GIA ĐÌNH (D1) — đăng nhập / đăng ký
   ============================================================ */
export async function dbQuery(query, params = []) {
  try {
    const j = await post('/db/query', { query, params })
    return j.results ? { results: j.results } : j
  } catch (e) {
    return { error: e.message }
  }
}

export async function dbExecute(query, params = []) {
  try {
    const j = await post('/db/execute', { query, params })
    return j.success !== false ? j : { error: 'execute failed' }
  } catch (e) {
    return { error: e.message }
  }
}

async function hashPass(pass, salt) {
  const data = new TextEncoder().encode(`${salt}::${pass}`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function ensureFamilies() {
  await dbExecute(
    `CREATE TABLE IF NOT EXISTS families (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE,
      salt TEXT,
      pass_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  )
}

export async function familyRegister(name, password, displayName = '', relation = '') {
  try {
    const res = await post('/api/v1/auth/register', {
      familyName: name,
      password,
      displayName,
      relation,
    })
    if (res.token) {
      setAuthToken(res.token)
    }
    return { ok: true, id: res.family.id, name: res.family.name, member: res.member, token: res.token }
  } catch (e) {
    return { ok: false, error: e.data?.error?.message || e.message || 'Không kết nối được máy chủ' }
  }
}

export async function familyLogin(name, password) {
  try {
    const res = await post('/api/v1/auth/login', {
      familyName: name,
      password,
    })
    if (res.token) {
      setAuthToken(res.token)
    }
    return { ok: true, id: res.family.id, name: res.family.name, member: res.member, token: res.token }
  } catch (e) {
    return { ok: false, error: e.data?.error?.message || e.message || 'Không kết nối được máy chủ' }
  }
}

export async function familyLogout() {
  try {
    const token = getAuthToken()
    if (token) {
      await post('/api/v1/auth/logout', {}).catch(() => {})
    }
  } finally {
    removeAuthToken()
  }
  return { ok: true }
}

/* ============================================================
   ☁️ ĐỒNG BỘ TRẠNG THÁI GIA ĐÌNH QUA /api/v1/family/state
   Có kiểm soát xung đột đồng thời (409 Conflict)
   ============================================================ */
export async function cloudLoadState(famId) {
  if (isTrialActive() || famId === 'fam_trial') {
    return {
      state: getTrialInitialState(),
      ts: Date.now(),
      serverTs: new Date().toISOString(),
    }
  }
  const token = getAuthToken()
  let networkFailed = false
  if (token) {
    try {
      const r = await fetch(GATEWAY + '/api/v1/family/state', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (r.ok) {
        const data = await r.json()
        return {
          state: data.state,
          ts: data.ts ? new Date(data.ts).getTime() : 0,
          serverTs: data.ts,
        }
      }
      if (r.status >= 500) networkFailed = true
    } catch (e) {
      networkFailed = true
      console.warn('V1 family state load failed, falling back:', e)
    }
  }
  const legacy = await dbKvGet(famCloudKey(famId))
  if (!legacy && networkFailed) return { error: 'network' }
  return legacy
}

export async function cloudSaveState(famId, state, baseTs = null) {
  if (isTrialActive() || famId === 'fam_trial') {
    return { saved: true, ts: Date.now() }
  }
  const token = getAuthToken()
  if (token) {
    try {
      const r = await fetch(GATEWAY + '/api/v1/family/state', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ state, baseTs: baseTs || null }),
      })
      if (r.status === 409) {
        const errData = await r.json()
        return {
          ok: false,
          conflict: true,
          serverState: errData.serverState,
          serverTs: errData.serverTs || null,
          serverTsMs: errData.serverTs ? new Date(errData.serverTs).getTime() : Date.now(),
        }
      }
      if (r.ok) {
        const data = await r.json()
        return { ok: true, saved: true, ts: data.ts }
      }
    } catch (e) {
      console.warn('V1 family state save failed, falling back:', e)
    }
  }
  return dbKvSet(famCloudKey(famId), { ts: state._ts, state })
}

export async function cloudDeleteFamily(password) {
  const token = getAuthToken()
  if (!token) return { ok: false, error: 'Chưa đăng nhập' }
  try {
    const res = await post('/api/v1/family', { password }, 25000, GATEWAY, {
      method: 'DELETE',
    })
    removeAuthToken()
    return { ok: true, deleted: true }
  } catch (e) {
    return { ok: false, error: e.data?.error?.message || e.message }
  }
}

/* ============================================================
   📝 GHI NHẬN BUỔI HỌC & SỰ KIỆN QUA /api/v1/sessions
   ============================================================ */
export async function startSession(sessionData) {
  try {
    return await post('/api/v1/sessions', sessionData)
  } catch (e) {
    console.warn('startSession warning:', e)
    return null
  }
}

export async function updateSession(sessionId, updateData) {
  try {
    const r = await fetch(`${GATEWAY}/api/v1/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(updateData),
    })
    return await r.json().catch(() => ({}))
  } catch (e) {
    console.warn('updateSession warning:', e)
    return null
  }
}

/* ============================================================
   🌐 TẢI CẤU HÌNH CÔNG KHAI (PROMPT, AI CONFIG, SCOPE)
   Cache 10 phút theo chuẩn gói Free Tier
   ============================================================ */
let publicConfigCache = null
let publicConfigCachedAt = 0

export async function loadPublicConfig(force = false) {
  const now = Date.now()
  if (!force && publicConfigCache && now - publicConfigCachedAt < 600000) {
    return publicConfigCache
  }
  try {
    const url = force ? `${GATEWAY}/api/v1/config/public?_refresh=1` : `${GATEWAY}/api/v1/config/public`
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      publicConfigCache = data
      publicConfigCachedAt = now
      return data
    }
  } catch (e) {
    console.warn('loadPublicConfig error:', e)
  }
  return publicConfigCache
}

/* ============================================================
   👑 ADMIN API — Quản trị người dùng & D1
   ============================================================ */
export async function adminFetchAllFamilies() {
  try {
    await ensureFamilies()
    const fRes = await dbQuery('SELECT id, name, created_at FROM families ORDER BY created_at DESC')
    const families = fRes.results || []

    const kvRes = await dbQuery("SELECT key, value, updated_at FROM _kv_store WHERE key LIKE '%fam%state%'")
    const kvList = kvRes.results || []
    const kvMap = {}
    for (const item of kvList) {
      try {
        const decodedKey = decodeURIComponent(item.key)
        const match = decodedKey.match(/fam:(fam_[^:]+):state/)
        if (match) {
          const valObj = typeof item.value === 'string' ? JSON.parse(item.value) : item.value
          kvMap[match[1]] = {
            state: valObj.state || valObj,
            ts: valObj.ts || 0,
            updated_at: item.updated_at,
          }
        }
      } catch (e) {}
    }

    return families.map((fam) => {
      const kv = kvMap[fam.id] || null
      const st = kv?.state || {}
      return {
        ...fam,
        children: st.children || [],
        parent: st.parent || 'Mẹ',
        tone: st.tone || 'Nhẹ nhàng',
        stats: st.stats || {},
        schedule: st.schedule || [],
        latestProblem: st.problem?.ocr || null,
        lastActive: kv?.updated_at || fam.created_at,
      }
    })
  } catch (e) {
    console.error('adminFetchAllFamilies error:', e)
    return []
  }
}

export async function adminResetPassword(famId, newPassword) {
  try {
    const salt = Math.random().toString(36).slice(2) + Date.now().toString(36)
    const hash = await hashPass(newPassword, salt)
    const r = await dbExecute('UPDATE families SET salt = ?, pass_hash = ? WHERE id = ?', [salt, hash, famId])
    return !r.error
  } catch (e) {
    return false
  }
}

export async function adminDeleteFamily(famId) {
  try {
    await dbExecute('DELETE FROM families WHERE id = ?', [famId])
    await dbExecute("DELETE FROM _kv_store WHERE key LIKE ? OR key LIKE ?", [
      `%${famId}%`,
      `%${encodeURIComponent(famId)}%`
    ])
    return true
  } catch (e) {
    return false
  }
}

export async function adminUpdateFamilyName(famId, newName) {
  try {
    const r = await dbExecute('UPDATE families SET name = ? WHERE id = ?', [newName.trim(), famId])
    return !r.error
  } catch (e) {
    return false
  }
}

/* ============================================================
   🚩 GÓP Ý GIẢNG CHƯA ĐÚNG — bảng teaching_feedback (D1)
   ============================================================ */
async function ensureTeachingFeedback() {
  await dbExecute(
    `CREATE TABLE IF NOT EXISTS teaching_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id TEXT,
      problem_type TEXT,
      reason TEXT,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  )
}

export async function saveTeachingFeedback({ familyId, problemType, reason, comment }) {
  try {
    await ensureTeachingFeedback()
    const r = await dbExecute(
      'INSERT INTO teaching_feedback (family_id, problem_type, reason, comment) VALUES (?, ?, ?, ?)',
      [familyId || '', problemType || '', reason || '', comment || '']
    )
    return !r.error
  } catch (e) {
    return false
  }
}

export async function adminFetchFeedback() {
  try {
    await ensureTeachingFeedback()
    const r = await dbQuery(
      `SELECT reason, COUNT(*) AS cnt FROM teaching_feedback GROUP BY reason ORDER BY cnt DESC`
    )
    const rows = r.results || []
    const recent = await dbQuery(
      `SELECT id, family_id, problem_type, reason, comment, created_at FROM teaching_feedback ORDER BY id DESC LIMIT 20`
    )
    return { counts: rows, recent: recent.results || [] }
  } catch (e) {
    return { counts: [], recent: [] }
  }
}

/* ============================================================
   📈 AI PHÂN TÍCH DỮ LIỆU LỚN STICKER & LỘ TRÌNH SƯ PHẠM
   Phân tích sự biến động phẩm chất (Kiên nhẫn, Sáng tạo,...) & điểm nghẽn
   ============================================================ */
export async function aiAnalyzeLongitudinalProgress({ child, stats, stickerHistory = [] }) {
  const validHistory = (stickerHistory || []).filter((s) => !s.sample)
  const thisWeek = validHistory.filter((s) => getWeekLabel(s.timestamp) === 'Tuần này')
  const lastWeek = validHistory.filter((s) => getWeekLabel(s.timestamp) === 'Tuần trước')

  const countTraits = (list) => {
    const map = {}
    list.forEach((s) => {
      const t = s.trait || s.name || 'Khác'
      map[t] = (map[t] || 0) + 1
    })
    return Object.entries(map).map(([k, v]) => `${v} sticker ${k}`).join(', ') || 'Chưa có sticker'
  }

  const thongKeTuanNay = countTraits(thisWeek)
  const thongKeTuanTruoc = countTraits(lastWeek)

  const weakList = (stats?.weak || []).map((w) => `${w.n}: vướng ${w.v}/${w.t} lần`).join('; ') || 'Chưa có dạng bài vướng nổi bật'
  const strongList = (stats?.strong || []).map((s) => `${s.n}: làm tốt ${s.v}/${s.t}`).join('; ') || 'Đang tiến bộ đều'
  const monHocVaVuongMac = `Điểm vướng: ${weakList}. Điểm vững: ${strongList}`

  const soCaHoc = `Mẹ kèm ${stats?.sessionsMom || 0} ca, Bố kèm ${stats?.sessionsDad || 0} ca. Phụ huynh bấm giữ bình tĩnh ${stats?.calmWeek || 0} lần.`

  const sysPrompt = renderPrompt('p7_longitudinal_analysis', {
    ten_be: child?.name || 'Bé',
    lop: child?.grade || 'Lớp 3',
    thong_ke_tuan_nay: thongKeTuanNay,
    thong_ke_tuan_truoc: thongKeTuanTruoc,
    mon_hoc_va_vuong_mac: monHocVaVuongMac,
    so_ca_hoc: soCaHoc,
  })

  try {
    const j = await postAi(
      '/chat',
      {
        messages: [
          { role: 'system', content: sysPrompt },
          { role: 'user', content: 'Hãy phân tích dữ liệu biến động phẩm chất và đề xuất lộ trình sư phạm cho con.' },
        ],
        max_tokens: 1200,
        temperature: 0.4,
      },
      30000
    )
    const resp = j?.response
    if (typeof resp === 'string' && resp.trim()) return resp.trim()
    return null
  } catch (e) {
    console.warn('Longitudinal analysis failed:', e)
    return null
  }
}

/* ============================================================
   🛡️ SCOPE ENGINE & AUDIT LOGGING (D1 DATABASE)
   Ghi nhật ký vi phạm phạm vi mà KHÔNG lưu ảnh hoặc đề bài nhạy cảm
   ============================================================ */

export async function classifyScopeTextWithAi(deBai, timeoutMs = 6000) {
  try {
    const prompt = renderPrompt('p0_scope_text', { de_bai: deBai })
    const j = await postAi(
      '/chat',
      {
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 120,
        temperature: 0,
      },
      timeoutMs
    )
    const raw = j?.response || j
    return extractJson(raw)
  } catch (e) {
    console.warn('classifyScopeTextWithAi timeout or error:', e)
    return null
  }
}

let scopeTableEnsured = false
async function ensureScopeEventsTable() {
  if (scopeTableEnsured) return
  try {
    await dbExecute(`
      CREATE TABLE IF NOT EXISTS scope_events (
        id TEXT PRIMARY KEY,
        family_id TEXT,
        source TEXT,
        category TEXT,
        action TEXT,
        confidence REAL,
        reason TEXT,
        grade_guess INTEGER,
        subject_guess TEXT,
        child_grade INTEGER,
        overridden INTEGER DEFAULT 0,
        created_at INTEGER
      );
    `)
    scopeTableEnsured = true
  } catch (e) {
    console.warn('ensureScopeEventsTable warning:', e)
  }
}

export async function logScopeEvent({
  familyId = 'default_family',
  source = 'camera', // 'camera' | 'text' | 'voice'
  category = 'bai_tap',
  action = 'allow',
  confidence = 1.0,
  reason = '',
  gradeGuess = null,
  subjectGuess = 'toan',
  childGrade = null,
  overridden = 0,
}) {
  try {
    await ensureScopeEventsTable()
    const id = 'se-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7)
    const createdAt = Date.now()
    // TUYỆT ĐỐI KHÔNG LƯU ẢNH VÀ KHÔNG LƯU ĐỀ CỦA LOẠI NHẠY CẢM
    const cleanReason = (category === 'nhay_cam' ? 'Phát hiện ảnh riêng tư' : String(reason || '')).slice(0, 100)
    await dbExecute(
      `INSERT INTO scope_events (id, family_id, source, category, action, confidence, reason, grade_guess, subject_guess, child_grade, overridden, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        familyId,
        source,
        category,
        action,
        typeof confidence === 'number' ? confidence : 1.0,
        cleanReason,
        typeof gradeGuess === 'number' ? gradeGuess : null,
        subjectGuess || 'toan',
        typeof childGrade === 'number' ? childGrade : null,
        overridden ? 1 : 0,
        createdAt,
      ]
    )
    return { success: true, id }
  } catch (e) {
    console.warn('logScopeEvent error (soft fail):', e)
    return { success: false, error: e.message }
  }
}

export async function getScopeEvents(limit = 20) {
  try {
    await ensureScopeEventsTable()
    const res = await dbQuery(
      `SELECT * FROM scope_events ORDER BY created_at DESC LIMIT ?`,
      [limit]
    )
    return Array.isArray(res?.results) ? res.results : []
  } catch (e) {
    console.warn('getScopeEvents error:', e)
    return []
  }
}

export async function getScopeStats() {
  try {
    await ensureScopeEventsTable()
    const now = Date.now()
    const thirtyDaysAgo = now - 30 * 86400000

    const countRes = await dbQuery(
      `SELECT category, COUNT(*) as cnt, SUM(overridden) as overridden_cnt
       FROM scope_events
       WHERE created_at >= ?
       GROUP BY category`,
      [thirtyDaysAgo]
    )

    const recentRes = await dbQuery(
      `SELECT * FROM scope_events ORDER BY created_at DESC LIMIT 20`
    )

    return {
      byCategory: Array.isArray(countRes?.results) ? countRes.results : [],
      recentEvents: Array.isArray(recentRes?.results) ? recentRes.results : [],
    }
  } catch (e) {
    return { byCategory: [], recentEvents: [] }
  }
}

/* ============================================================
   👨‍👩‍👧 PROMPT 03: API NHÓM GIA ĐÌNH & BÁO CÁO ZALO
   ============================================================ */

export async function createFamilyInvite({ role = 'guardian', relationHint = '' }) {
  const token = getAuthToken()
  const res = await fetch(`${GATEWAY}/api/v1/family/invites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role, relationHint }),
  })
  return res.json()
}

export async function getFamilyInvites() {
  const token = getAuthToken()
  const res = await fetch(`${GATEWAY}/api/v1/family/invites`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function revokeFamilyInvite(code) {
  const token = getAuthToken()
  const res = await fetch(`${GATEWAY}/api/v1/family/invites/${code}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function getPublicInvite(code) {
  const res = await fetch(`${GATEWAY}/api/v1/invites/${code}`)
  return res.json()
}

export async function acceptInvite(code, { displayName, relation, pin }) {
  const res = await fetch(`${GATEWAY}/api/v1/invites/${code}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName, relation, pin }),
  })
  return res.json()
}

export async function getFamilyMembers() {
  if (isTrialActive()) {
    return {
      ok: true,
      members: [
        { id: "mem_mom", name: "Mẹ (Chủ gia đình)", role: "owner", relation_hint: "Mẹ", email: "me.kemcon@example.com", is_active: true },
        { id: "mem_dad", name: "Bố (Người giám hộ)", role: "guardian", relation_hint: "Bố", email: "bo.kemcon@example.com", is_active: true },
      ],
    }
  }
  const token = getAuthToken()
  const res = await fetch(`${GATEWAY}/api/v1/family/members`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function updateFamilyMember(id, payload) {
  const token = getAuthToken()
  const res = await fetch(`${GATEWAY}/api/v1/family/members/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  return res.json()
}

export async function deleteFamilyMember(id) {
  const token = getAuthToken()
  const res = await fetch(`${GATEWAY}/api/v1/family/members/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function createDeviceCode(memberId = null) {
  const token = getAuthToken()
  const res = await fetch(`${GATEWAY}/api/v1/auth/device-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ memberId }),
  })
  return res.json()
}

export async function loginWithDeviceCode({ code, pin }) {
  const res = await fetch(`${GATEWAY}/api/v1/auth/login-device`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, pin }),
  })
  return res.json()
}

export async function shareWeeklyReport({ childId, week, snapshot, expiresDays = 7 }) {
  const token = getAuthToken()
  const res = await fetch(`${GATEWAY}/api/v1/reports/weekly/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ childId, week, snapshot, expiresDays }),
  })
  return res.json()
}

export async function getPublicReport(token) {
  const res = await fetch(`${GATEWAY}/api/v1/reports/shared/${token}`)
  return res.json()
}

export async function getSharedReportsList() {
  const token = getAuthToken()
  const res = await fetch(`${GATEWAY}/api/v1/reports/shared-list`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function revokeSharedReport(token) {
  const authToken = getAuthToken()
  const res = await fetch(`${GATEWAY}/api/v1/reports/shared/${token}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${authToken}` },
  })
  return res.json()
}

/* ============================================================
   🏫 PROMPT 11: CLASS PREVIEW, JOIN LINK, 24H CHILD CHANGE & REMINDERS
   ============================================================ */

/* Máy chủ có chỗ trả camelCase (teacherName, className), có chỗ snake_case (teacher_name, class_name).
   Gom về cả hai kiểu để mọi màn hình đọc được tên lớp / tên cô. */
export function normalizeClassInfo(c) {
  if (!c || typeof c !== 'object') return c
  const t = c.teacher && typeof c.teacher === 'object' ? c.teacher : {}
  const teacherName =
    c.teacher_name || c.teacherName || c.teacher_display_name || c.teacherDisplayName ||
    t.display_name || t.displayName || t.name || (typeof c.teacher === 'string' ? c.teacher : '') || ''
  const className = c.class_name || c.className || c.name || ''
  const schoolName = c.school_name || c.schoolName || ''
  const schoolYear = c.school_year || c.schoolYear || ''
  const joinCode = c.join_code || c.joinCode || ''
  return {
    ...c,
    id: c.id ?? c.classId ?? c.class_id,
    class_id: c.class_id ?? c.classId ?? c.id,
    name: c.name || className,
    class_name: className,
    className,
    teacher_name: teacherName,
    teacherName,
    school_name: schoolName,
    schoolName,
    school_year: schoolYear,
    join_code: joinCode,
    grade: c.grade ?? c.gradeLevel ?? '',
    prefillName: c.prefillName || c.prefill_name || '',
    class_student_id: c.class_student_id ?? c.classStudentId,
    child_id: c.child_id ?? c.childId,
    linked_at: c.linked_at || c.linkedAt,
    roster_name: c.roster_name || c.rosterName,
    reject_reason: c.reject_reason || c.rejectReason,
    completed_items: c.completed_items ?? c.completedItems,
    linked_by_name: c.linked_by_name || c.linkedByName,
  }
}

/* "Cô Mai" / "Thầy An" giữ nguyên; "Mai" → "cô Mai"; trống → "cô chủ nhiệm" */
export function teacherLabel(name) {
  const n = String(name || '').trim()
  if (!n) return 'cô chủ nhiệm'
  return /^(cô|thầy|co|thay)\s/i.test(n) ? n : `cô ${n}`
}

export async function fetchClassPreview(code) {
  if (!code) return { ok: false, error: 'Thiếu mã lớp' }
  const res = await fetch(`${GATEWAY}/api/v1/classes/preview?code=${encodeURIComponent(code)}`)
  const data = await res.json().catch(() => ({}))
  if (data && data.class) data.class = normalizeClassInfo(data.class)
  if (res.status === 404 && data && !data.error) data.error = 'Không tìm thấy lớp với mã này'
  return data
}

export async function joinFamilyClass({ token, code, childId, childName, childGrade, rosterName, consent, childConsent, claimCode }) {
  const res = await fetch(`${GATEWAY}/api/v1/family/classes/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      code: code ? code.trim().toUpperCase() : undefined,
      claimCode: claimCode ? claimCode.trim().toUpperCase() : undefined,
      childId,
      childName,
      childGrade,
      rosterName,
      consent,
      childConsent,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (data && data.class) data.class = normalizeClassInfo(data.class)
  // httpStatus: mã HTTP thật (409 = trùng). status: trạng thái vào lớp từ máy chủ (active/pending) nếu có.
  return { status: res.status, ...data, httpStatus: res.status, ok: data.ok ?? res.ok }
}

export async function changeClassChild({ token, classStudentId, childId }) {
  const res = await fetch(`${GATEWAY}/api/v1/family/classes/${classStudentId}/child`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ childId }),
  })
  const data = await res.json()
  return { status: res.status, ...data }
}

export async function leaveFamilyClass({ token, classStudentId, deleteResults = false }) {
  const res = await fetch(`${GATEWAY}/api/v1/family/classes/${classStudentId}?deleteResults=${deleteResults ? '1' : '0'}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function fetchFamilyReminders({ token, window = 'today' }) {
  const res = await fetch(`${GATEWAY}/api/v1/family/reminders?window=${window}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function markFamilyReminderDone({ token, announcementId }) {
  const res = await fetch(`${GATEWAY}/api/v1/family/announcements/${announcementId}/done`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

/* ============================================================
   CHẤM VỞ, KHÔNG SỬA HỘ (Prompt 14 Phần A)
   ============================================================ */

export async function checkWorkRead({ image, childId, sessionId, problemText, recheckOf, isSelfie }) {
  if (isTrialActive()) {
    await new Promise((r) => setTimeout(r, 600))
    if (isSelfie) {
      return { check_id: `chk_trial_${Date.now()}_rejected`, de_bai: problemText || '', cac_dong: [], doc_duoc: false, ly_do: 'không phải bài làm' }
    }
    const lesson = getActiveTrialLesson(problemText)
    const cv = TRIAL_LESSON_EXTRAS[lesson.id].cham_vo
    return {
      check_id: `chk_trial_${lesson.id}_${Date.now()}`,
      de_bai: lesson.de_bai,
      cac_dong: (recheckOf ? cv.dong_dung : cv.dong_sai).map((d) => ({ ...d })),
      doc_duoc: true,
      ly_do: '',
    }
  }

  const token = getAuthToken()
  const formData = new FormData()
  if (image instanceof Blob || image instanceof File) {
    formData.append('image', image)
  } else if (typeof image === 'string') {
    formData.append('image', image)
  }
  if (childId) formData.append('child_id', childId)
  if (sessionId) formData.append('session_id', sessionId)
  if (problemText) formData.append('problem_text', problemText)
  if (recheckOf) formData.append('recheck_of', recheckOf)
  if (isSelfie) formData.append('is_selfie', 'true')

  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${AI_GATEWAY}/api/v1/ai/check-work/read`, {
    method: 'POST',
    headers,
    body: formData,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || 'Lỗi đọc ảnh bài làm')
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export async function checkWorkGrade({ checkId, deBai, cacDong, linesEdited, lop, xungHo, tenCon, recheckOf }) {
  if (isTrialActive()) {
    await new Promise((r) => setTimeout(r, 800))
    const lesson = getActiveTrialLesson(deBai)
    const cv = TRIAL_LESSON_EXTRAS[lesson.id].cham_vo
    const norm = (x) => String(x?.noi_dung ?? x).replace(/\s+/g, ' ').trim()
    const isFixed = Boolean(recheckOf) || (cacDong || []).map(norm).join('|') === cv.dong_dung.map(norm).join('|')
    const g = isFixed ? cv.cham_dung : cv.cham_sai
    return { check_id: checkId, ...g, cau_hoi_cho_con: { ...g.cau_hoi_cho_con }, self_fixed: isFixed ? 1 : 0, guard_action: 'pass' }
  }

  const token = getAuthToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${AI_GATEWAY}/api/v1/ai/check-work/${checkId}/grade`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      de_bai: deBai,
      cac_dong: cacDong,
      lines_edited: linesEdited,
      lop,
      xung_ho: xungHo,
      ten_con: tenCon,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || 'Lỗi chấm bài')
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export async function checkWorkGet(checkId) {
  const token = getAuthToken()
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${AI_GATEWAY}/api/v1/ai/check-work/${checkId}`, { headers })
  return res.json()
}

export async function checkWorkHistory() {
  const token = getAuthToken()
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${AI_GATEWAY}/api/v1/ai/check-work/history`, { headers })
  return res.json()
}

/* ============================================================
   🎓 NGHE CON GIẢNG LẠI (Prompt 14 Phần B)
   ============================================================ */

export async function teachBackTranscribe({ audioBlob }) {
  if (isTrialActive()) {
    await new Promise((r) => setTimeout(r, 600))
    return { ok: true, transcript: TRIAL_LESSON_EXTRAS[getActiveTrialLesson().id].giang_lai.transcript }
  }

  const token = getAuthToken()
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  let body
  if (audioBlob instanceof Blob || audioBlob instanceof File) {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'teachback.webm')
    body = formData
  } else if (typeof audioBlob === 'string') {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify({ audio: audioBlob })
  } else {
    body = audioBlob
  }

  const res = await fetch(`${AI_GATEWAY}/api/v1/ai/teach-back/transcribe`, {
    method: 'POST',
    headers,
    body,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || 'Lỗi nhận diện giọng nói')
    err.status = res.status
    throw err
  }
  return data
}

export async function teachBackGrade({
  sessionId,
  childId,
  familyId,
  problemText,
  standardSteps,
  transcript,
  round = 1,
  finalAnswer,
  lop = 'Lớp 3',
  tenCon = 'Mít',
}) {
  if (isTrialActive()) {
    await new Promise((r) => setTimeout(r, 700))
    return {
      ok: true,
      teach_back_id: `tb_trial_${Date.now()}`,
      tieu_chi: TRIAL_LESSON_EXTRAS[getActiveTrialLesson(problemText).id].giang_lai.tieu_chi.map((t) => ({ ...t })),
      muc_de_xuat: 'self',
      cau_hoi_them: '',
      loi_khen_cho_con: `Bé ${String(tenCon || "").replace(/^bé\s+/i, "")} kể lại các bước rất tự tin và nhớ chính xác từng số liệu!`,
      hallucination_detected: false,
    }
  }

  const token = getAuthToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${AI_GATEWAY}/api/v1/ai/teach-back/grade`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      sessionId,
      childId,
      familyId,
      problemText,
      standardSteps,
      transcript,
      round,
      finalAnswer,
      lop,
      tenCon,
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || 'Lỗi chấm bài giảng lại')
    err.status = res.status
    throw err
  }
  return data
}

export async function teachBackConfirm({ teachBackId, finalLevel }) {
  if (isTrialActive()) {
    return { ok: true, id: teachBackId, final_level: finalLevel }
  }

  const token = getAuthToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${AI_GATEWAY}/api/v1/ai/teach-back/${teachBackId}/confirm`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ finalLevel }),
  })

  return res.json()
}

/* ============================================================
   🛡️ AN TOÀN AI & PHỤ HUYNH BÁO CÂU CHƯA HỢP (Prompt 14 Phần C)
   ============================================================ */
export async function sendAiFeedback({ familyId, sessionId, promptId, step, reason, note, questionText }) {
  if (isTrialActive()) {
    return { ok: true, id: 'trial_fb_' + Date.now(), message: 'Phản hồi dùng thử thành công' }
  }
  const token = getAuthToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${AI_GATEWAY}/api/v1/ai-feedback`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ familyId, sessionId, promptId, step, reason, note, questionText }),
  })
  return res.json()
}

export async function getSafetySummary(range = '7d') {
  if (isTrialActive()) {
    return {
      ok: true,
      safe_rate_percent: 100.0,
      total_guard_interventions: 0,
      guard_events: { total: 0, fallbacks: 0, regenerated: 0, leaked: 0 },
      feedback: { total: 0, open: 0, byReason: {} },
      work_checks: { total: 0, self_fixed: 0 },
      teach_backs: { total: 0, self_level: 0 },
      dot18_safety: {
        phep_tinh_sai_da_bat: 0,
        bac_bo_chan_sua_lai: 0,
        cau_nho_hon_da_tao: 0,
        so_lan_gau_nghe_con: 0,
      },
      four_layer_safety: [
        { layer: 1, name: 'Prompt Sư phạm Socratic', status: 'active', desc: 'Không giải bài hộ, chia 3 bậc gợi ý' },
        { layer: 2, name: 'Bộ chặn rò rỉ đáp án (Guard Module)', status: 'active', desc: 'Kiểm tra số chữ/số nguyên, thay thế tự động nếu lộ' },
        { layer: 3, name: 'Máy tính độc lập & Khử ảo giác', status: 'active', desc: 'Shunting-yard parser & Anti-hallucination quote checker' },
        { layer: 4, name: 'Quyền chốt của Phụ huynh', status: 'active', desc: 'Mẹ luôn là người duyệt & chốt mức hiểu bài cuối cùng' },
      ],
    }
  }
  const token = getAuthToken()
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${AI_GATEWAY}/api/v1/safety/summary?range=${encodeURIComponent(range)}`, { headers })
  return res.json()
}

export async function getSafetyLog({ limit = 50, familyId } = {}) {
  if (isTrialActive()) {
    return { ok: true, guard_logs: [], feedbacks: [] }
  }
  const token = getAuthToken()
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const q = new URLSearchParams()
  if (limit) q.set('limit', limit)
  if (familyId) q.set('familyId', familyId)

  const res = await fetch(`${AI_GATEWAY}/api/v1/safety/log?${q.toString()}`, { headers })
  return res.json()
}

export async function testGuardFilter({ promptId, data, context }) {
  const token = getAuthToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${AI_GATEWAY}/api/v1/safety/test-guard`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ promptId, data, context }),
  })
  return res.json()
}

export async function closeAiFeedback(feedbackId) {
  const token = getAuthToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${AI_GATEWAY}/api/v1/admin/ai-feedback/${feedbackId}/close`, {
    method: 'POST',
    headers,
  })
  return res.json()
}
/* ============================================================
   🐻 GẤU NHỚ CON — SỰ KIỆN HỌC VÀ HỒ SƠ 30 NGÀY (PROMPT 18 CHẶNG 2)
   ============================================================ */
export async function recordLearningEvent(event) {
  if (isTrialActive()) return { ok: true, offline: true }
  try {
    return await post('/api/v1/family/learning-events', event)
  } catch (err) {
    console.warn('recordLearningEvent error:', err)
    return { error: err.message }
  }
}

export async function fetchLearnerProfile(childId, childName = 'Bé', days = 30) {
  if (isTrialActive() || !childId) {
    return { ok: true, profile: 'chưa có', stuckSkills: [], solidSkills: [], count: 0, hasHistory: false }
  }
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 10000)
    const token = getAdminToken() || getAuthToken()
    const headers = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(
      `${GATEWAY}/api/v1/family/learning-events?child_id=${encodeURIComponent(childId)}&days=${days}&child_name=${encodeURIComponent(childName)}`,
      { headers, signal: ctrl.signal }
    )
    clearTimeout(t)
    if (!res.ok) return { ok: false, profile: 'chưa có', stuckSkills: [], solidSkills: [] }
    return await res.json()
  } catch (err) {
    console.warn('fetchLearnerProfile error:', err)
    return { ok: false, profile: 'chưa có', stuckSkills: [], solidSkills: [] }
  }
}

export async function clearLearnerHistory(childId) {
  if (isTrialActive() || !childId) return { ok: true }
  try {
    const token = getAdminToken() || getAuthToken()
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${GATEWAY}/api/v1/family/learning-events?child_id=${encodeURIComponent(childId)}`, {
      method: 'DELETE',
      headers,
    })
    return await res.json()
  } catch (err) {
    console.warn('clearLearnerHistory error:', err)
    return { error: err.message }
  }
}

export async function fetchAiProgressReport(childId, childName = 'Bé', options = {}) {
  if (isTrialActive()) {
    const sCount = typeof options.sessionsCount === 'number' ? options.sessionsCount : 3;
    if (sCount < 3) {
      return {
        ok: false,
        error: {
          code: 'NOT_ENOUGH_DATA',
          message: `Cần ít nhất 3 buổi học để phân tích tiến bộ. ${childName} mới học ${sCount} buổi.`
        },
        sessions_count: sCount,
        required: 3,
        child_name: childName
      };
    }
    return {
      ok: true,
      report: {
        tom_tat: `${childName} đang tiến bộ đều đặn. Con làm chắc các phép tính cơ bản, cần rèn thêm cách tóm tắt đề bài toán 2 bước.`,
        hay_ket: ['Đọc hiểu đề'],
        da_vung: ['Tính toán cơ bản'],
        tu_lam_count: sCount,
        goi_y_cho_me: [
          'Cho con kể lại đề bằng lời của con',
          'Đố ngược: mẹ đọc đáp số, con đoán đề',
          'Duy trì 15 phút mỗi tối'
        ],
        nguon_du_lieu: {
          so_buoi: sCount,
          tu_ngay: '20/10',
          den_ngay: '26/10'
        }
      },
      fact_basis: {
        so_buoi: sCount,
        tu_ngay: '20/10',
        den_ngay: '26/10',
        hay_ket: ['Đọc hiểu đề'],
        da_vung: ['Tính toán cơ bản'],
        tu_lam_count: sCount
      },
      cached: false
    };
  }

  try {
    const res = await post('/api/v1/ai/progress', { child_id: childId, child_name: childName }, 30000, AI_GATEWAY);
    return res;
  } catch (err) {
    console.warn('fetchAiProgressReport error:', err);
    return { ok: false, error: { code: 'NETWORK_ERROR', message: 'Không thể kết nối máy chủ phân tích' } };
  }
}

export async function fetchAiMicroStep({
  problemText = '',
  stepQuestion = '',
  stepAnswer = '',
  hintsUsed = [],
  skill = 'tinh_toan',
  childProfile = '',
  childSpeech = '',
  microIndex = 1,
  childName = 'Bé',
  sessionId = null,
  familyId = null,
} = {}) {
  if (isTrialActive()) {
    const sampleQuestions = [
      `${childName} tìm trong đề chữ đứng trước số nhé. Số đó là bao nhiêu?`,
      `Nếu bớt đi thì số còn lại nhiều hơn hay ít hơn lúc đầu hả ${childName}?`
    ];
    return {
      ok: true,
      micro_step: {
        cau_hoi_nho: sampleQuestions[(microIndex - 1) % sampleQuestions.length] || sampleQuestions[0],
        dap_an_cho_me: stepAnswer || 'Số liệu trong đề',
        ly_do_cho_me: 'Giúp con nhận diện đúng dữ kiện nhỏ nhất trước khi bắt đầu tính.',
        micro_index: microIndex,
      },
      latency_ms: 120,
    };
  }

  try {
    const res = await post(
      '/api/v1/ai/micro-step',
      {
        problem_text: problemText,
        step_question: stepQuestion,
        step_answer: stepAnswer,
        hints_used: hintsUsed,
        skill,
        child_profile: childProfile,
        child_speech: childSpeech,
        micro_index: microIndex,
        child_name: childName,
        session_id: sessionId,
        family_id: familyId,
      },
      12000,
      AI_GATEWAY
    );
    return res;
  } catch (err) {
    console.warn('fetchAiMicroStep error:', err);
    return { ok: false, error: { code: 'TIMEOUT_OR_NETWORK', message: err.message } };
  }
}

export async function fetchAiJudgeAnswer({
  stepQuestion = '',
  stepAnswer = '',
  childSpeech = '',
  problemText = '',
  childName = 'Bé',
} = {}) {
  let cleanSpeech = childSpeech.trim();
  cleanSpeech = cleanSpeech.replace(/\bkhông\s+(biết|rõ|hiểu|thấy|phải|được)\b/gi, "ko $1");
  try {
    cleanSpeech = viNumberWords(cleanSpeech).replace(/(\d+)\s*chục\b/gi, (_, n) => String(Number(n) * 10));
  } catch (_) {}

  if (isTrialActive()) {
    const lower = cleanSpeech.toLowerCase();
    const ansNums = (stepAnswer.match(/\b\d+\b/g) || []);
    const speechNums = (cleanSpeech.match(/\b\d+\b/g) || []);
    const isAllNums = ansNums.length > 0 && ansNums.every(n => speechNums.includes(n));
    const hasAnyNum = ansNums.some(n => speechNums.includes(n));

    let verdict = {
      danh_gia: "khong_ro",
      nhan_xet_cho_me: "Chưa nghe rõ câu trả lời của con.",
      cau_me_noi_tiep: "Con nói lại to hơn cho Gấu nghe nhé!",
      khen_cu_the: "Cố lên con!"
    };

    const hasOpMismatch = (lower.includes("cộng") && stepAnswer.toLowerCase().includes("trừ")) ||
                          (lower.includes("trừ") && stepAnswer.toLowerCase().includes("cộng"));

    if (hasOpMismatch) {
      verdict = {
        danh_gia: "sai_huong",
        nhan_xet_cho_me: `${childName} đã đúng số nhưng chọn nhầm phép tính.`,
        cau_me_noi_tiep: "Con nhìn lại xem trong đề hỏi còn lại hay thêm vào nhé?",
        khen_cu_the: "Con đã tìm đúng số rồi!"
      };
    } else if (isAllNums || lower.includes("đúng") || lower.includes("chính xác")) {
      verdict = {
        danh_gia: "dung",
        nhan_xet_cho_me: `${childName} đã nêu đúng kết quả!`,
        cau_me_noi_tiep: "Đúng rồi! Con giỏi quá!",
        khen_cu_the: `Giỏi lắm ${childName} ơi!`
      };
    } else if (hasAnyNum || lower.includes("gần") || lower.includes("suýt") || Math.abs((Number(speechNums[0]) || 0) - (Number(ansNums[0]) || 0)) <= 2) {
      verdict = {
        danh_gia: "gan_dung",
        nhan_xet_cho_me: `${childName} đã đúng một số trong bài.`,
        cau_me_noi_tiep: "Con đã tìm đúng một số rồi, còn bước tính nữa nào?",
        khen_cu_the: "Con làm tốt một phần rồi!"
      };
    } else if (speechNums.length > 0 || lower.includes("cộng") || lower.includes("trừ")) {
      verdict = {
        danh_gia: "sai_huong",
        nhan_xet_cho_me: `${childName} đang chọn số hoặc phép tính chưa đúng.`,
        cau_me_noi_tiep: "Con nhìn lại xem trong đề bài hỏi còn lại hay thêm vào nhé?",
        khen_cu_the: "Không sao, con nhìn lại đề nào!"
      };
    }

    return {
      ok: true,
      verdict,
      cleanSpeech,
      latency_ms: 80,
    };
  }

  try {
    const res = await post(
      '/api/v1/ai/judge-answer',
      {
        step_question: stepQuestion,
        step_answer: stepAnswer,
        child_speech: cleanSpeech,
        problem_text: problemText,
        child_name: childName,
      },
      10000,
      AI_GATEWAY
    );
    if (res && res.ok) {
      res.cleanSpeech = cleanSpeech;
    }
    return res;
  } catch (err) {
    console.warn('fetchAiJudgeAnswer error:', err);
    return { ok: false, error: { code: 'TIMEOUT_OR_NETWORK', message: err.message } };
  }
}

export async function fetchAiAdaptiveBrother({
  problemText = '',
  stuckSkill = 'tinh_toan',
  grade = 3,
  bookSeries = 'Kết nối tri thức',
  childName = 'Bé',
} = {}) {
  if (isTrialActive()) {
    return {
      ok: true,
      brother: {
        de: `Bố hái 2 chục quả cam, đã biếu bà 6 quả. Hỏi bố còn bao nhiêu quả cam?`,
        ky_nang_nham: stuckSkill,
        vi_sao_cho_me: `Luyện tập kỹ năng ${stuckSkill} với bài toán cùng dạng.`,
        dap_an_cho_me: `2 chục = 20. 20 - 6 = 14 quả cam.`,
      },
      math_verified: true,
      latency_ms: 100,
    };
  }

  try {
    const res = await post(
      '/api/v1/ai/brother',
      {
        problem_text: problemText,
        stuck_skill: stuckSkill,
        grade,
        book_series: bookSeries,
        child_name: childName,
      },
      12000,
      AI_GATEWAY
    );
    return res;
  } catch (err) {
    console.warn('fetchAiAdaptiveBrother error:', err);
    return { ok: false, error: { code: 'TIMEOUT_OR_NETWORK', message: err.message } };
  }
}


// ==========================================================
// ĐỢT 19: LỊCH SỬ PHẨM CHẤT & ĐỔI QUÀ (BADGE & REWARD EVENTS)
// ==========================================================

export async function recordBadgeEvent(event) {
  if (isTrialActive()) return { ok: true, offline: true };
  try {
    return await post("/api/v1/family/badge-events", event);
  } catch (err) {
    console.warn("recordBadgeEvent error:", err);
    return { error: err.message };
  }
}

export async function fetchBadgeEvents({ childId = "", limit = 1000 } = {}) {
  if (isTrialActive()) {
    return { ok: true, count: 0, events: [] };
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);
    const token = getAdminToken() || getAuthToken();
    const headers = {};
    if (token) headers["Authorization"] = "Bearer " + token;
    const query = new URLSearchParams();
    if (childId) query.set("child_id", childId);
    if (limit) query.set("limit", String(limit));
    const res = await fetch(`${GATEWAY}/api/v1/family/badge-events?${query.toString()}`, {
      headers,
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) return { ok: false, count: 0, events: [] };
    return await res.json();
  } catch (err) {
    console.warn("fetchBadgeEvents error:", err);
    return { ok: false, count: 0, events: [] };
  }
}

export async function deleteBadgeEvents(childId) {
  if (isTrialActive() || !childId) return { ok: true };
  try {
    const token = getAdminToken() || getAuthToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = "Bearer " + token;
    const res = await fetch(`${GATEWAY}/api/v1/family/badge-events?child_id=${encodeURIComponent(childId)}`, {
      method: "DELETE",
      headers,
    });
    return await res.json();
  } catch (err) {
    console.warn("deleteBadgeEvents error:", err);
    return { error: err.message };
  }
}

export async function recordRewardEvent(event) {
  if (isTrialActive()) return { ok: true, offline: true };
  try {
    return await post("/api/v1/family/reward-events", event);
  } catch (err) {
    console.warn("recordRewardEvent error:", err);
    return { error: err.message };
  }
}

export async function fetchRewardEvents({ childId = "" } = {}) {
  if (isTrialActive()) {
    return { ok: true, count: 0, events: [] };
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);
    const token = getAdminToken() || getAuthToken();
    const headers = {};
    if (token) headers["Authorization"] = "Bearer " + token;
    const query = new URLSearchParams();
    if (childId) query.set("child_id", childId);
    const res = await fetch(`${GATEWAY}/api/v1/family/reward-events?${query.toString()}`, {
      headers,
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) return { ok: false, count: 0, events: [] };
    return await res.json();
  } catch (err) {
    console.warn("fetchRewardEvents error:", err);
    return { ok: false, count: 0, events: [] };
  }
}

export async function migrateLegacyBadges(payload = {}) {
  if (isTrialActive()) return { ok: true, scanned_states: 0, badges_migrated: 0, rewards_migrated: 0 };
  try {
    return await post("/api/v1/family/migrate-legacy-badges", payload);
  } catch (err) {
    console.warn("migrateLegacyBadges error:", err);
    return { error: err.message };
  }
}


export async function fetchAiTraitAnalysis({
  childId = "",
  childName = "Bé",
  facts = {},
  options = {},
} = {}) {
  if (isTrialActive()) {
    const s1 = typeof options.week1_sessions === "number" ? options.week1_sessions : 4;
    const s2 = typeof options.week2_sessions === "number" ? options.week2_sessions : 5;
    if (s1 < 3 || s2 < 3) {
      const missing = Math.max(0, 3 - s1) + Math.max(0, 3 - s2);
      return {
        ok: false,
        error: {
          code: "NOT_ENOUGH_DATA",
          message: `Cần ít nhất 2 tuần, mỗi tuần từ 3 buổi học để AI phân tích nguyên nhân. Hiện có: Tuần trước: ${s1}/3 buổi, Tuần này: ${s2}/3 buổi. Còn thiếu ${missing} buổi.`
        },
        week1_count: s1,
        week2_count: s2,
        required_per_week: 3,
        missing_count: missing,
      };
    }
    return {
      ok: true,
      analysis: {
        tom_tat: "Sáng tạo giảm từ 5 xuống 1, Kiên nhẫn tăng từ 3 lên 4.",
        nhan_dinh: [
          {
            y: "Bài lặp lại nhiều làm con ít cơ hội sáng tạo cách mới.",
            can_cu: ["7/9 bài tuần này là bảng nhân 4 (tuần trước 2/8). Bài lặp lại ít chỗ cho cách làm mới."]
          },
          {
            y: "Thiếu các hoạt động giải tỏa tương tác giữa mẹ và con.",
            can_cu: ["0 lần \"Con đố mẹ\" hay trò chơi 5 phút (tuần trước 3 lần)."]
          },
          {
            y: "Buổi học kéo dài làm con nhanh mệt và giảm tập trung.",
            can_cu: ["Buổi học dài trung bình 24 phút (tuần trước 15 phút)."]
          }
        ],
        lo_trinh_7_ngay: [
          "2 tối đầu: đổi sang toán lời văn có tình huống trong nhà.",
          `Tối thứ 3: để ${childName} tự đặt một đề đố mẹ.`,
          "Giữ mỗi buổi khoảng 15 phút, xong là chơi 5 phút."
        ],
        luu_y: "Đây là gợi ý, mẹ quyết định."
      },
      facts: {
        total_sessions: 17,
        from_date: "13/10",
        to_date: "26/10",
        traits_w1: { "Kiên nhẫn": 3, "Sáng tạo": 5, "Tập trung": 2, "Tỉ mỉ": 1 },
        traits_w2: { "Kiên nhẫn": 4, "Sáng tạo": 1, "Tập trung": 3, "Tỉ mỉ": 2 },
      },
      sessions_read: 17,
      from_date: "13/10",
      to_date: "26/10",
      latency_ms: 100
    };
  }

  try {
    const res = await post(
      "/api/v1/ai/trait-analysis",
      {
        child_id: childId,
        child_name: childName,
        ...facts,
        ...options,
      },
      25000,
      AI_GATEWAY
    );
    return res;
  } catch (err) {
    console.warn("fetchAiTraitAnalysis error:", err);
    return { ok: false, error: { code: "NETWORK_ERROR", message: err.message } };
  }
}
