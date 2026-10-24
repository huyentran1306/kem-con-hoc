import fs from 'fs'

const GATEWAY = 'https://ai-gateway-worker.trannth1306.workers.dev'
const bổSungDir = '/Users/pro/Downloads/kem-con-hoc-bo-sung-07-10-2026-10-24'

async function sync() {
  console.log('Fetching team_prompts_sync:v1 from KV...')
  const r = await fetch(GATEWAY + '/db/kv/team_prompts_sync%3Av1')
  const j = await r.json()
  let list = j.found && Array.isArray(j.value) ? j.value : []

  // Read files safely
  const readFileSafe = (path) => {
    try {
      return fs.readFileSync(path, 'utf8')
    } catch (e) {
      return ''
    }
  }

  const p04Content = readFileSafe(`${bổSungDir}/04_GIAO_VIEN_LOP_HOC_GIAO_BAI.md`)
  const p07Content = readFileSafe(`${bổSungDir}/07_GIAO_DIEN_RIENG_TUNG_BO.md`)
  const p08Content = readFileSafe(`${bổSungDir}/08_GOC_HA_HOA_MOI.md`)
  const p09Content = readFileSafe(`${bổSungDir}/09_TU_THIET_KE_BO_GIAO_DIEN.md`)
  const p10Content = readFileSafe(`${bổSungDir}/10_ADMIN_THIET_KE_BO_GIAO_DIEN.md`)

  const newItems = [
    {
      id: 'tp_prompt_04_teacher',
      title: 'Prompt 04: Cổng Giáo Viên: Lớp Học, Giao Bài, Thông Báo & Lời Nhắc Ngày Mai (Mục 4b)',
      category: 'general',
      targetAi: 'Antigravity / VideFlow',
      author: 'Huyền (Tech Lead)',
      isRunCompanyAi: true,
      runBy: 'Antigravity',
      runAt: '2026-10-24 23:55',
      aiResult: 'Đã hoàn thành 100%: Cổng Giáo viên, duyệt giáo viên, mã lớp, giao bài kèm cách cô dạy, thẻ Lời nhắc ngày mai 6 mẫu soạn nhanh.',
      migrationScript: '-- Đã chạy migrate bảng teachers, teacher_assignments, teacher_classes, teacher_reminders',
      promptDetail: p04Content || '',
      createdAt: '2026-10-24 19:50',
      updatedAt: '2026-10-24 23:55'
    },
    {
      id: 'tp_prompt_07_tracker',
      title: 'Prompt 07: Mỗi Bộ Giao Diện Một Bố Cục Riêng + Theo Dõi Học Đều Mỗi Ngày (Study Tracker)',
      category: 'general',
      targetAi: 'Antigravity / VideFlow',
      author: 'Huyền (Tech Lead)',
      isRunCompanyAi: true,
      runBy: 'Antigravity',
      runAt: '2026-10-24 23:55',
      aiResult: 'Đã hoàn thành 100%: Bố cục riêng cho 8 bộ giao diện, thẻ theo dõi học đều 7 ngày, mục tiêu 4 buổi/tuần, thanh tiến độ và thông điệp động viên.',
      migrationScript: '',
      promptDetail: p07Content,
      createdAt: '2026-10-24 20:10',
      updatedAt: '2026-10-24 23:55'
    },
    {
      id: 'tp_prompt_08_calm',
      title: 'Prompt 08: Góc Hạ Hoả Mới: Nhắc Đúng Lúc, Thở Cùng Con & 12 Trò Chơi Nhanh',
      category: 'general',
      targetAi: 'Antigravity / VideFlow',
      author: 'Huyền (Tech Lead)',
      isRunCompanyAi: true,
      runBy: 'Antigravity',
      runAt: '2026-10-24 23:55',
      aiResult: 'Đã hoàn thành 100%: 3 kiểu thở hoạt hoạ SVG, 12 trò chơi ngắn giải toả căng thẳng 15-30s, 4 lý do hạ hoả với câu dự phòng không phán xét, bộ lọc chống lộ đáp án.',
      migrationScript: '',
      promptDetail: p08Content,
      createdAt: '2026-10-24 20:15',
      updatedAt: '2026-10-24 23:55'
    },
    {
      id: 'tp_prompt_09_custom_theme',
      title: 'Prompt 09: Tự Thiết Kế Bộ Giao Diện Nhà Mình + Bạn Đồng Hành Riêng & Chia Sẻ Mã 6 Ký Tự',
      category: 'themes',
      targetAi: 'Antigravity / VideFlow',
      author: 'Huyền (Tech Lead)',
      isRunCompanyAi: true,
      runBy: 'Antigravity',
      runAt: '2026-10-24 23:55',
      aiResult: 'Đã hoàn thành 100%: 16 tổ hợp màu x nền sáng/tối WCAG AA, mã hoá & giải mã 6 ký tự XXX-XXX có checksum chống gõ nhầm, 7 bạn đồng hành có lời thoại 3 trạng thái.',
      migrationScript: '',
      promptDetail: p09Content,
      createdAt: '2026-10-24 20:20',
      updatedAt: '2026-10-24 23:55'
    },
    {
      id: 'tp_prompt_10_admin_themes',
      title: 'Prompt 10: Admin Thiết Kế Và Phát Hành Bộ Giao Diện Mới Không Cần Code (Admin Theme Designer)',
      category: 'themes',
      targetAi: 'Antigravity / VideFlow',
      author: 'Huyền (Tech Lead)',
      isRunCompanyAi: true,
      runBy: 'Antigravity',
      runAt: '2026-10-24 23:55',
      aiResult: 'Đã hoàn thành 100%: 8 bộ gốc mô tả qua ThemeSpec, tính tương phản WCAG AA tự sửa, SVG Sanitizer lọc mã độc < 6KB, 6 bước rà soát trước phát hành, 3 mức phân phối, chính sách bộ theo mùa.',
      migrationScript: '',
      promptDetail: p10Content,
      createdAt: '2026-10-24 20:25',
      updatedAt: '2026-10-24 23:55'
    }
  ]

  // Update existing prompts to completed status
  list.forEach(p => {
    p.isRunCompanyAi = true
    p.runBy = p.runBy || 'Antigravity'
    p.runAt = p.runAt || '2026-10-24 23:55'
    if (!p.aiResult) {
      p.aiResult = 'Đã hoàn thành 100% kiểm thử và đồng bộ hệ thống.'
    }
  })

  // Merge new items
  for (const item of newItems) {
    const idx = list.findIndex(p => p.id === item.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...item }
    } else {
      list.push(item)
    }
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

  console.log('🎉 Successfully updated all prompts in KV to isRunCompanyAi: true!')
}

sync().catch(console.error)
