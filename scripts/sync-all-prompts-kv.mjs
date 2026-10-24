import fs from 'fs'

const GATEWAY = 'https://ai-gateway-worker.trannth1306.workers.dev'

const prompt00Md = fs.readFileSync('/Users/pro/Downloads/re-design/00_NEN_TANG_TAI_KHOAN_VA_BAO_MAT.md', 'utf8')
const prompt01Md = fs.readFileSync('/Users/pro/Downloads/re-design/01_GIAO_DIEN_THEO_SO_THICH_GIA_DINH.md', 'utf8')
const prompt02Md = fs.readFileSync('/Users/pro/Downloads/re-design/02_KIEM_TRA_ANH_NGOAI_PHAM_VI.md', 'utf8')
const prompt03Md = fs.readFileSync('/Users/pro/Downloads/re-design/03_NHOM_GIA_DINH_VA_BAO_CAO_ZALO.md', 'utf8')
const prompt06Md = fs.readFileSync('/Users/pro/Downloads/re-design/06_SUA_LOI_NHANH_VA_BO_DU_LIEU_GIA.md', 'utf8')
const schema00Sql = fs.readFileSync('/Users/pro/Downloads/workspace (2)/scripts/schema-prompt-00.sql', 'utf8')
const schema03Sql = fs.readFileSync('/Users/pro/Downloads/workspace (2)/scripts/schema-prompt-03.sql', 'utf8')

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
      isRunCompanyAi: false,
      runBy: '',
      runAt: '',
      aiResult: '',
      migrationScript: `-- ============================================================
-- PROMPT 00: SCHEMA DATABASE CHO MÔ HÌNH BẢO MẬT MỚI
-- Lệnh chạy: npx wrangler d1 execute <tên-db> --remote --file=scripts/schema-prompt-00.sql
-- ============================================================
\${schema00Sql}`,
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
      isRunCompanyAi: false,
      runBy: '',
      runAt: '',
      aiResult: '',
      migrationScript: '',
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
      isRunCompanyAi: false,
      runBy: '',
      runAt: '',
      aiResult: '',
      migrationScript: '',
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
      isRunCompanyAi: false,
      runBy: '',
      runAt: '',
      aiResult: '',
      migrationScript: `-- ============================================================
-- PROMPT 02: BẢNG SCOPE EVENTS & CẤU HÌNH LUẬT TRÊN D1
-- Lệnh tạo bảng nhật ký phạm vi (D1 Audit Log):
CREATE TABLE IF NOT EXISTS scope_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_scope_events_time ON scope_events(created_at);

-- Lệnh đồng bộ luật cấu hình mặc định vào D1 KV:
node scripts/sync-prompt-02-kv.mjs
-- ============================================================`,
      promptDetail: prompt02Md,
      createdAt: '2026-10-24 17:21',
      updatedAt: '2026-10-24 18:30'
    },
    {
      id: 'tp_prompt_03_zalo',
      title: 'Prompt 03: Nhóm Gia Đình Nhiều Người & Gửi Báo Cáo Tuần Qua Zalo',
      category: 'general',
      targetAi: 'VideFlow',
      author: 'Huyền (Tech Lead)',
      isRunCompanyAi: false,
      runBy: '',
      runAt: '',
      aiResult: '',
      migrationScript: `-- ============================================================
-- PROMPT 03: SCHEMA D1 CHO NHÓM GIA ĐÌNH, MÃ MỜI VÀ BÁO CÁO ZALO
-- Lệnh chạy: npx wrangler d1 execute <tên-db> --remote --file=scripts/schema-prompt-03.sql
-- ============================================================
${schema03Sql}`,
      promptDetail: prompt03Md,
      createdAt: '2026-10-24 19:30',
      updatedAt: '2026-10-24 19:45'
    }
  ]

  for (const item of updates) {
    const idx = list.findIndex(p => p.id === item.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...item }
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

  console.log('🎉 Successfully synced all prompts with migrationScript to Cloudflare D1 KV!')
}

run().catch(console.error)
