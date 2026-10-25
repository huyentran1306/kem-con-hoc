import fs from 'fs'

const GATEWAY = 'https://ai-gateway-worker.trannth1306.workers.dev'
const prompt11Path = '/Users/pro/Downloads/workspace (2)/re-design/bo-sung-dot-2-2026-10-25/11_CONG_GIAO_VIEN_BAN_GAU.md'

async function sync() {
  console.log('Fetching team_prompts_sync:v1 from KV...')
  const r = await fetch(GATEWAY + '/db/kv/team_prompts_sync%3Av1')
  const j = await r.json()
  let list = j.found && Array.isArray(j.value) ? j.value : []

  const p11Content = fs.existsSync(prompt11Path) ? fs.readFileSync(prompt11Path, 'utf8') : ''

  const p11Item = {
    id: 'tp_prompt_11_teacher_bear',
    title: 'Prompt 11: Nâng Cấp Cổng Giáo Viên Bản Gấu, Cô Nhắc & Vào Lớp Bằng Link (Parts A, B, C)',
    category: 'general',
    targetAi: 'Antigravity',
    author: 'Huyền (Tech Lead)',
    isRunCompanyAi: true,
    runBy: 'Antigravity',
    runAt: '2026-10-25 10:30',
    aiResult: 'Đã hoàn thành 100%: Cổng giáo viên Bản Gấu (Mitr/Nunito, WCAG AA >= 4.5:1), 6 mẫu Cô nhắc có ngày kèm 3 chỉ số tương tác, Phụ huynh vào lớp bằng link/QR code, chọn con, cảnh báo lệch khối, sinh đôi, đổi con 24h và chặn trùng.',
    migrationScript: '-- scripts/migration-prompt-11.sql: ADD child_changed_at, kind, remind_for, template_id, assignment_id, done_at, done_by_member_id, uq_class_student_active',
    promptDetail: p11Content,
    createdAt: '2026-10-25 00:25',
    updatedAt: '2026-10-25 10:30'
  }

  const idx = list.findIndex(p => p.id === p11Item.id)
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...p11Item }
  } else {
    list.push(p11Item)
  }

  console.log(`Total prompts in KV: ${list.length}`)
  for (const kvKey of ['team_prompts_sync:v1', 'team_prompts_sync%3Av1']) {
    const saveRes = await fetch(`${GATEWAY}/db/kv/${kvKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: list })
    })
    console.log(`Save status for ${kvKey}: ${saveRes.status}`)
  }

  console.log('🎉 Successfully synced Prompt 11 to D1 KV team_prompts_sync:v1!')
}

sync().catch(console.error)
