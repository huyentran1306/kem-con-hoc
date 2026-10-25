/* ============================================================
   CLIENT GATEWAY — API Service & Database Bridge
   ============================================================ */
import { PROBLEM } from './data.js'
import { renderPrompt, getActiveAiConfig, classifyProblemDynamic } from './promptStudio.js'
import { getWeekLabel } from './utils.js'
import { parseOcrV2Result, evaluateTextScope, DEFAULT_SCOPE_RULES, SCOPE_RULES_KV_KEY, parseGradeNum } from './scopeRules.js'

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

async function post(path, body, timeoutMs = 25000, baseUrl = GATEWAY, extraHeaders = {}) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  const token = getAuthToken()
  const headers = { 'Content-Type': 'application/json', ...extraHeaders }
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`
  }
  try {
    const r = await fetch(baseUrl + path, {
      method: 'POST',
      headers,
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
   Hỗ trợ p1_ocr_v2 gộp phân loại phạm vi (bài tập, nhạy cảm, đồ chơi, ảnh mờ, nhiều bài)
   ============================================================ */
export async function aiOcr(file, timeoutMs = 15000, context = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const fd = new FormData()
    fd.append('image', file, 'homework.jpg')
    // Ưu tiên p1_ocr_v2 gộp kiểm tra phạm vi, fallback sang p1_ocr cũ
    const ocrPrompt = renderPrompt('p1_ocr_v2') || renderPrompt('p1_ocr')
    fd.append('prompt', ocrPrompt)

    // Ưu tiên 1: Llama 3.2 Vision qua /vision/analyze
    try {
      const rVision = await fetch(AI_GATEWAY + '/vision/analyze', {
        method: 'POST',
        body: fd,
        signal: ctrl.signal,
      })
      if (rVision.ok) {
        const jv = await rVision.json()
        let analysis = jv.analysis || ''
        if (analysis) {
          analysis = analysis
            .replace(/^Được rồi,.*?:\s*/i, '')
            .replace(/^\*\*ĐỀ BÀI:\*\*\s*/i, '')
            .replace(/^Đề bài toán tiểu học là:\s*/i, '')
            .replace(/Tôi hy vọng điều đó.*$/is, '')
            .trim()
          if (analysis.length >= 3) {
            const scope = parseOcrV2Result(analysis, context)
            const text = (scope.de_bai || analysis).trim()
            return {
              text,
              scopeResult: scope,
              raw: analysis,
            }
          }
        }
      }
    } catch (eVision) {
      console.warn('Vision analyze retry fallback:', eVision)
    }

    // Ưu tiên 2: Fallback sang /vision/ocr
    const fdOcr = new FormData()
    fdOcr.append('image', file, 'homework.jpg')
    const r = await fetch(AI_GATEWAY + '/vision/ocr', {
      method: 'POST',
      body: fdOcr,
      signal: ctrl.signal,
    })
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
        }
      }
    }

    return null
  } catch (e) {
    return null
  } finally {
    clearTimeout(timer)
  }
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
export async function aiExtractProblem(rawOcr) {
  if (!rawOcr || !rawOcr.trim()) return null
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
export async function aiExplain(ocr, child, tone, parentNote = '', isStuck = false) {
  const grade = child?.grade || 'Lớp 2'
  const book = child?.book || 'Kết nối tri thức'
  const classification = fastClassifyProblem(ocr, grade)

  const sys = renderPrompt('p3_explain', {
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
  })

  const aiCfg = getActiveAiConfig()

  const isValidExplain = (d) => {
    if (!d || typeof d !== 'object') return false
    if (d.can_hoi_lai && String(d.can_hoi_lai).trim()) return true
    if (Array.isArray(d.cac_bac) && d.cac_bac.length >= 3 && d.cac_bac[0]?.cau_hoi) return true
    if (Array.isArray(d.steps) && d.steps.length >= 3 && (d.steps[0]?.question || d.steps[0]?.q)) return true
    return false
  }

  const userPrompt = `Soạn bài cho đề sau theo đúng schema. Chỉ trả JSON.\nĐề bài: """${ocr}"""`

  try {
    let j = await postAi(
      '/chat',
      {
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: aiCfg.max_tokens || 1500,
        temperature: typeof aiCfg.temperature === 'number' ? aiCfg.temperature : 0.3,
        model: aiCfg.model || 'cloudflare-llama-3.3-70b',
      },
      aiCfg.timeout_ms || 30000,
      { 'X-Prompt-Id': 'p3_explain' }
    )
    let data = extractJson(j.response ?? j)

    // Nếu lần đầu lỗi JSON hoặc thiếu schema, tự động thử lại 1 lần
    if (!isValidExplain(data)) {
      const retryResp = await postAi(
        '/chat',
        {
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: userPrompt },
            { role: 'assistant', content: String(j?.response || '') },
            { role: 'user', content: 'Trả lại đúng JSON theo schema, không thêm chữ.' },
          ],
          max_tokens: 1500,
          temperature: 0.2,
        },
        20000,
        { 'X-Prompt-Id': 'p3_explain' }
      )
      data = extractJson(retryResp.response ?? retryResp)
    }

    if (!isValidExplain(data)) {
      return {
        error: 'format_error',
        message: 'AI trả lời chưa đúng định dạng, mẹ thử lại nhé',
      }
    }

    // Chuẩn hóa bậc câu hỏi (hỗ trợ cả cac_bac schema Socratic mới và steps schema cũ)
    let rawSteps = []
    if (Array.isArray(data.cac_bac) && data.cac_bac.length > 0) {
      rawSteps = data.cac_bac.map((b, idx) => ({
        question: b.cau_hoi || `Bậc ${idx + 1}`,
        answerForParent: b.dap_an_cho_me || '',
        answer: b.dap_an_cho_me || '',
        hint: b.goi_y?.muc_1_do_vat || (typeof b.goi_y === 'string' ? b.goi_y : ''),
        hint2: b.goi_y?.muc_2_hinh_ve || '',
        praise: data.loi_khen || 'Con rất nỗ lực!',
      }))
    } else if (Array.isArray(data.steps) && data.steps.length > 0) {
      rawSteps = data.steps.map((s) => ({
        question: s.question || s.q || '',
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
    return null
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
    const r = await fetch(GATEWAY + '/db/kv/' + encodeURIComponent(key))
    if (!r.ok) return null
    const j = await r.json()
    return j.found ? j.value : null
  } catch (e) {
    return null
  }
}

export async function dbKvSet(key, value) {
  try {
    const r = await fetch(GATEWAY + '/db/kv/' + encodeURIComponent(key), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
  const token = getAuthToken()
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
    } catch (e) {
      console.warn('V1 family state load failed, falling back:', e)
    }
  }
  return dbKvGet(famCloudKey(famId))
}

export async function cloudSaveState(famId, state, baseTs = null) {
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
    const url = force ? `${GATEWAY}/api/v1/config/public?t=${now}` : `${GATEWAY}/api/v1/config/public`
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

export async function fetchClassPreview(code) {
  if (!code) return { ok: false, error: 'Thiếu mã lớp' }
  const res = await fetch(`${GATEWAY}/api/v1/classes/preview?code=${encodeURIComponent(code)}`)
  return res.json()
}

export async function joinFamilyClass({ token, code, childId, rosterName, consent, childConsent, claimCode }) {
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
      rosterName,
      consent,
      childConsent,
    }),
  })
  const data = await res.json()
  return { status: res.status, ...data }
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