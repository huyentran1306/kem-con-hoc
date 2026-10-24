/* ============================================================
   CLIENT GATEWAY — API Service & Database Bridge
   ============================================================ */
import { PROBLEM } from './data'
import { renderPrompt, getActiveAiConfig, classifyProblemDynamic } from './promptStudio'

export const GATEWAY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_GATEWAY) || 'https://ai-gateway-worker.trannth1306.workers.dev'
export const AI_GATEWAY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AI_GATEWAY) || 'https://ai-gateway-worker.trannth1306.workers.dev'
export const CLOUD_KEY = 'kem-con-hoc:state'

async function post(path, body, timeoutMs = 25000, baseUrl = GATEWAY) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const r = await fetch(baseUrl + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
    if (!r.ok) throw new Error('HTTP ' + r.status)
    return await r.json()
  } finally {
    clearTimeout(t)
  }
}

async function postAi(path, body, timeoutMs = 25000) {
  return post(path, body, timeoutMs, AI_GATEWAY)
}

/* Lấy JSON từ response (gateway có thể trả object hoặc chuỗi) */
function extractJson(raw) {
  if (raw && typeof raw === 'object') return raw
  const m = String(raw || '').match(/\{[\s\S]*\}/)
  if (!m) return null
  try {
    return JSON.parse(m[0])
  } catch (e) {
    return null
  }
}

/* ============================================================
   🔍 OCR — đọc chữ từ ảnh chụp bài tập (multipart → /vision/ocr)
   Có AbortController timeout 12s tránh treo mạng
   ============================================================ */
export async function aiOcr(file, timeoutMs = 15000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const fd = new FormData()
    fd.append('image', file, 'homework.jpg')
    const ocrPrompt = renderPrompt('p1_ocr')
    fd.append('prompt', ocrPrompt)

    // Ưu tiên 1: Llama 3.2 Vision qua /vision/analyze (Đọc chữ viết tay tiếng Việt & chữ in tốt nhất)
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
          if (analysis.length >= 5 && !analysis.includes('không thể đọc') && !analysis.includes('Chơi gì với đồ')) {
            return analysis
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
        return text.trim()
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
export async function aiExplain(ocr, child, tone, parentNote = '') {
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
  })

  const aiCfg = getActiveAiConfig()

  try {
    let j = await postAi(
      '/chat',
      {
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: 'Phân tích bài này' },
        ],
        max_tokens: aiCfg.max_tokens || 1500,
        temperature: typeof aiCfg.temperature === 'number' ? aiCfg.temperature : 0.3,
        model: aiCfg.model || 'cloudflare-llama-3.3-70b',
      },
      aiCfg.timeout_ms || 30000
    )
    let data = extractJson(j.response ?? j)

    // Nếu lần đầu lỗi JSON, tự động thử lại 1 lần với thông báo "Chỉ trả JSON hợp lệ"
    if (!data) {
      const retryResp = await postAi(
        '/chat',
        {
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: 'Phân tích bài này' },
            { role: 'assistant', content: String(j?.response || '') },
            { role: 'user', content: 'Chỉ trả về DUY NHẤT một đối tượng JSON hợp lệ theo đúng schema yêu cầu, không thêm bất kỳ chữ nào khác.' },
          ],
          max_tokens: 1500,
          temperature: 0.2,
        },
        20000
      )
      data = extractJson(retryResp.response ?? retryResp)
    }

    if (!data) return null

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

export async function familyRegister(name, password) {
  try {
    await ensureFamilies()
    const salt = Math.random().toString(36).slice(2) + Date.now().toString(36)
    const hash = await hashPass(password, salt)
    const id = 'fam_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    const r = await dbExecute('INSERT INTO families (id, name, salt, pass_hash) VALUES (?, ?, ?, ?)', [
      id, name, salt, hash,
    ])
    if (r.error) return { ok: false, error: 'Tên gia đình đã có người dùng' }
    return { ok: true, id }
  } catch (e) {
    return { ok: false, error: 'Không kết nối được máy chủ' }
  }
}

export async function familyLogin(name, password) {
  try {
    await ensureFamilies()
    const r = await dbQuery('SELECT id, salt, pass_hash FROM families WHERE name = ?', [name])
    const row = r.results && r.results[0]
    if (!row) return { ok: false, error: 'Không tìm thấy gia đình "' + name + '"' }
    const hash = await hashPass(password, row.salt)
    if (hash !== row.pass_hash) return { ok: false, error: 'Sai mật khẩu rồi' }
    return { ok: true, id: row.id }
  } catch (e) {
    return { ok: false, error: 'Không kết nối được máy chủ' }
  }
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
  const thisWeek = stickerHistory.filter((s) => s.week === 'Tuần này')
  const lastWeek = stickerHistory.filter((s) => s.week === 'Tuần trước')

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