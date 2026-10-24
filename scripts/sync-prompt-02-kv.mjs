import fs from 'fs'

const GATEWAY = 'https://ai-gateway-worker.trannth1306.workers.dev'
const prompt02Md = fs.readFileSync('/Users/pro/Downloads/re-design/02_KIEM_TRA_ANH_NGOAI_PHAM_VI.md', 'utf8')

async function run() {
  console.log('Fetching team_prompts_sync:v1 from D1 KV...')
  const r = await fetch(GATEWAY + '/db/kv/team_prompts_sync%3Av1')
  const j = await r.json()
  let list = j.found && Array.isArray(j.value) ? j.value : []
  console.log('Existing prompts in KV:', list.map(p => p.id))

  const existingIdx = list.findIndex(p => p.id === 'tp_prompt_02_scope')
  const promptItem = {
    id: 'tp_prompt_02_scope',
    title: 'Prompt 02: Kiểm Tra Ảnh Và Đề Ngoài Phạm Vi (Luật Cấu Hình Trong Admin & D1 Audit)',
    category: 'vision_ocr',
    targetAi: 'VideFlow',
    author: 'Huyền (Tech Lead)',
    isRunCompanyAi: false,
    runBy: '',
    runAt: '',
    aiResult: '',
    promptDetail: prompt02Md,
    createdAt: '2026-10-24 18:30',
    updatedAt: '2026-10-24 18:30'
  }

  if (existingIdx >= 0) {
    list[existingIdx] = promptItem
  } else {
    list.push(promptItem)
  }

  console.log('Saving updated prompt list to D1 KV... total prompts:', list.length)
  const saveRes = await fetch(GATEWAY + '/db/kv/team_prompts_sync%3Av1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: list })
  })

  console.log('Save status:', saveRes.status)
  if (saveRes.ok) {
    console.log('🎉 Successfully synced tp_prompt_02_scope to Cloudflare D1 KV team_prompts_sync:v1!')
  } else {
    console.error('Save failed:', await saveRes.text())
    process.exit(1)
  }
}

run().catch(console.error)
