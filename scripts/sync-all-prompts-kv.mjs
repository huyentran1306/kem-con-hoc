import fs from 'fs'

const GATEWAY = 'https://ai-gateway-worker.trannth1306.workers.dev'

const prompt00Md = fs.readFileSync('/Users/pro/Downloads/re-design/00_NEN_TANG_TAI_KHOAN_VA_BAO_MAT.md', 'utf8')
const prompt01Md = fs.readFileSync('/Users/pro/Downloads/re-design/01_GIAO_DIEN_THEO_SO_THICH_GIA_DINH.md', 'utf8')
const prompt02Md = fs.readFileSync('/Users/pro/Downloads/re-design/02_KIEM_TRA_ANH_NGOAI_PHAM_VI.md', 'utf8')
const prompt06Md = fs.readFileSync('/Users/pro/Downloads/re-design/06_SUA_LOI_NHANH_VA_BO_DU_LIEU_GIA.md', 'utf8')

async function run() {
  console.log('Fetching team_prompts_sync:v1 from D1 KV...')
  const r = await fetch(GATEWAY + '/db/kv/team_prompts_sync%3Av1')
  const j = await r.json()
  let list = j.found && Array.isArray(j.value) ? j.value : []
  console.log('Existing prompts in KV:', list.map(p => p.id))

  const updates = [
    {
      id: 'tp_prompt_00_auth',
      title: 'Prompt 00: Nền Tảng Tài Khoản, Bảo Mật Máy Chủ & Tối Ưu Cloudflare Free Tier',
      category: 'general',
      targetAi: 'VideFlow',
      author: 'Huyền (Tech Lead)',
      isRunCompanyAi: true,
      runBy: 'Huyền',
      runAt: '2026-10-24 19:10',
      aiResult: 'Đã hoàn thành 100%: API /api/v1 (auth, token 60d, state 409 conflict, cascade delete, cron cleanup), D1 schema 9 bảng tối ưu, test 72/72 PASS',
      promptDetail: prompt00Md,
      createdAt: '2026-10-24 17:21',
      updatedAt: '2026-10-24 19:10'
    },
    {
      id: 'tp_prompt_06_enhancement',
      title: 'Prompt 06: Sửa Lỗi Nhanh, Bỏ Dữ Liệu Giả & Đánh Dấu Sticker Mẫu Chuẩn Idempotent',
      category: 'general',
      targetAi: 'Cursor / VideFlow',
      author: 'Huyền (Tech Lead)',
      isRunCompanyAi: true,
      runBy: 'Huyền',
      runAt: '2026-10-24 18:00',
      aiResult: 'Đã hoàn thành: Đánh dấu sample: true cho h1..h15, Thứ Hai tuần theo VN UTC+7, bộ đếm đúng, sửa font tab',
      promptDetail: prompt06Md,
      createdAt: '2026-10-24 17:21',
      updatedAt: '2026-10-24 18:00'
    },
    {
      id: 'tp_prompt_01_themes',
      title: 'Prompt 01: 8 Bộ Giao Diện Theo Sở Thích Gia Đình & Chuẩn Tương Phản WCAG AA',
      category: 'general',
      targetAi: 'Cursor / VideFlow',
      author: 'Huyền (Tech Lead)',
      isRunCompanyAi: true,
      runBy: 'Huyền',
      runAt: '2026-10-24 18:15',
      aiResult: 'Đã hoàn thành: 8 bộ giao diện chuẩn WCAG AA, ThemePickerSheet, CSS variables đồng bộ, kiểm thử tương phản 100% pass',
      promptDetail: prompt01Md,
      createdAt: '2026-10-24 16:53',
      updatedAt: '2026-10-24 18:15'
    },
    {
      id: 'tp_prompt_02_scope',
      title: 'Prompt 02: Bộ Kiểm Tra & Phân Loại Ảnh/Đề Ngoài Phạm Vi (Scope Rules & OCR V2)',
      category: 'vision_ocr',
      targetAi: 'VideFlow',
      author: 'Huyền (Tech Lead)',
      isRunCompanyAi: true,
      runBy: 'Huyền',
      runAt: '2026-10-24 18:30',
      aiResult: 'Đã hoàn thành: scopeRules.js 9 loại phạm vi, Test Bench 6 mẫu vector, p1_ocr_v2 Vision AI, Audit log D1, UI Scope Banner',
      promptDetail: prompt02Md,
      createdAt: '2026-10-24 17:21',
      updatedAt: '2026-10-24 18:30'
    }
  ]

  for (const item of updates) {
    const idx = list.findIndex(p => p.id === item.id)
    if (idx >= 0) {
      list[idx] = item
    } else {
      list.push(item)
    }
  }

  console.log('Saving updated prompt list to D1 KV... total prompts:', list.length)
  for (const kvKey of ['team_prompts_sync:v1', 'team_prompts_sync%3Av1']) {
    const saveRes = await fetch(GATEWAY + '/db/kv/' + kvKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: list })
    })
    console.log(`Save status for ${kvKey}:`, saveRes.status)
  }

  console.log('🎉 Successfully synced all prompts (00, 06, 01, 02) to Cloudflare D1 KV team_prompts_sync:v1!')
}

run().catch(console.error)
