/**
 * scripts/compare-28-v2-v3.mjs — Prompt 28 A3 · Tự kiểm: đặt câu hỏi của p3_explain_v2 và p3_explain_v3 cạnh nhau cho 5 đề.
 * Cần mạng tới ai-gateway-worker (chạy trên máy có mạng). Tốn 10–15 lần gọi AI (2 prompt × 5 đề + sửa đúng chỗ nếu cần).
 * Chạy: node scripts/compare-28-v2-v3.mjs > bang-chung/prompt28-30/so-sanh-v2-v3.md
 */
import { renderPrompt } from '../src/promptStudio.js'
import { auditSteps } from '../src/stepQuality.js'

const GATEWAY = process.env.AI_GATEWAY || 'https://ai-gateway-worker.trannth1306.workers.dev'
const DE = [
  { mon: 'Toán', lop: 'Lớp 3', de: 'Bà có 5 rổ trứng, mỗi rổ 6 quả. Bà làm bánh hết 8 quả. Hỏi bà còn lại bao nhiêu quả trứng?' },
  { mon: 'Toán', lop: 'Lớp 3', de: 'Mẹ mua 4 hộp bút, mỗi hộp 8 cây. Mẹ cho Bin 7 cây. Hỏi mẹ còn bao nhiêu cây bút?' },
  { mon: 'Toán', lop: 'Lớp 3', de: 'Thư viện có 3 giá sách, mỗi giá 25 quyển. Các bạn mượn đi 18 quyển. Hỏi thư viện còn lại bao nhiêu quyển sách?' },
  { mon: 'Toán', lop: 'Lớp 2', de: 'Lan có 18 quả cam chia đều vào 3 rổ. Hỏi mỗi rổ có mấy quả cam?' },
  { mon: 'Tiếng Việt', lop: 'Lớp 2', de: "Điền vào chỗ trống l hay n: 'Mùa xuân, cây cối đâm chồi ...ảy ...ộc, hoa cúc ...ở rộ khắp vườn.'" },
]

function extractJson(t) {
  const s = String(t || '')
  const a = s.indexOf('{'); const b = s.lastIndexOf('}')
  if (a < 0 || b < 0) return null
  try { return JSON.parse(s.slice(a, b + 1)) } catch { return null }
}

async function ask(promptId, item) {
  const sys = renderPrompt(promptId, { mon: item.mon, lop: item.lop, de_bai: item.de, ho_so_con: 'chưa có', xung_ho: 'mẹ' })
  const r = await fetch(GATEWAY + '/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Prompt-Id': promptId, 'X-Bypass-Cache': '1' },
    body: JSON.stringify({
      messages: [{ role: 'system', content: sys }, { role: 'user', content: `Soạn bài cho đề sau theo đúng schema. Chỉ trả JSON.\nĐề bài: """${item.de}"""` }],
      max_tokens: promptId === 'p3_explain_v3' ? 900 : 1400,
      temperature: 0.3,
    }),
  })
  const j = await r.json().catch(() => ({}))
  return extractJson(j.response ?? j)
}

console.log('# So sánh câu hỏi p3_explain_v2 và p3_explain_v3 (sau sửa 28)\n')
for (const item of DE) {
  const [v2, v3] = [await ask('p3_explain_v2', item), await ask('p3_explain_v3', item)]
  const q = (d) => (d?.cac_bac || []).map((b) => b.cau_hoi)
  const a2 = auditSteps(d2(v2), item.de, item.mon); const a3 = auditSteps(d2(v3), item.de, item.mon)
  console.log(`## ${item.de}\n`)
  console.log('| Bậc | v2 | v3 |\n|---|---|---|')
  const n = Math.max(q(v2).length, q(v3).length)
  for (let i = 0; i < n; i++) console.log(`| ${i + 1} | ${q(v2)[i] || ''} | ${q(v3)[i] || ''} |`)
  console.log(`\nMáy kiểm: v2 ${a2.ok ? 'đạt' : a2.issues.map((x) => x.text).join('; ')} · v3 ${a3.ok ? 'đạt' : a3.issues.map((x) => x.text).join('; ')}\n`)
}
function d2(d) { return d?.cac_bac || [] }
