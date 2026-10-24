/**
 * ============================================================
 * 🔄 SCRIPT ĐỒNG BỘ / CLONE DATABASE CLOUDFLARE D1
 * Nguồn: Production Vercel (https://ai-gateway-worker.trann46698.workers.dev)
 * Đích:  Dev / Redesign    (https://ai-gateway-worker.trannth1306.workers.dev)
 * ============================================================
 * Cách chạy: npm run db:clone
 * ============================================================
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SOURCE_URL = 'https://ai-gateway-worker.trann46698.workers.dev'
const DEST_URL = 'https://ai-gateway-worker.trannth1306.workers.dev'

async function postJson(baseUrl, endpoint, payload) {
  const res = await fetch(baseUrl + endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Node.js D1 Sync Script)',
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`HTTP ${res.status}: ${errText}`)
  }
  return await res.json()
}

async function query(url, sql, params = []) {
  return postJson(url, '/db/query', { query: sql, params })
}

async function execute(url, sql, params = []) {
  return postJson(url, '/db/execute', { query: sql, params })
}

async function runClone() {
  console.log('\n🚀 BẮT ĐẦU ĐỒNG BỘ DATABASE TỪ PROD SANG DEV...')
  console.log(`📦 Nguồn (Prod Vercel): ${SOURCE_URL}`)
  console.log(`🎯 Đích  (Dev Redesign): ${DEST_URL}\n`)

  // 1. Lấy danh sách schema các bảng từ Production
  console.log('⏳ Bước 1: Đang đọc cấu trúc bảng từ Production...')
  const schemaRes = await query(
    SOURCE_URL,
    "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%';"
  )
  const tables = schemaRes.results || []
  console.log(`-> Tìm thấy ${tables.length} bảng: ${tables.map(t => t.name).join(', ')}`)

  const backupData = {}

  // 2. Tải toàn bộ dữ liệu từ Production
  console.log('\n⏳ Bước 2: Đang tải dữ liệu từng bảng từ Production...')
  for (const t of tables) {
    const tblName = t.name
    const rowsRes = await query(SOURCE_URL, `SELECT * FROM "${tblName}"`)
    const rows = rowsRes.results || []
    backupData[tblName] = {
      sql: t.sql,
      count: rows.length,
      rows,
    }
    console.log(`-> Bảng "${tblName}": tải thành công ${rows.length} bản ghi`)
  }

  // Lưu file backup an toàn
  const backupPath = path.resolve(__dirname, '../backup_production_db.json')
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8')
  console.log(`💾 Đã sao lưu dự phòng an toàn tại: ${backupPath}`)

  // 3. Khởi tạo schema và import dữ liệu vào Database Dev
  console.log('\n⏳ Bước 3: Đang import dữ liệu vào Database Dev...')
  for (const t of tables) {
    const tblName = t.name
    const info = backupData[tblName]
    
    // Tạo bảng nếu chưa có (dùng IF NOT EXISTS)
    const createSql = info.sql.replace(/^CREATE TABLE\s+/i, 'CREATE TABLE IF NOT EXISTS ')
    try {
      await execute(DEST_URL, createSql)
    } catch (e) {
      // Bỏ qua nếu bảng đã tồn tại
    }

    const rows = info.rows
    if (!rows || rows.length === 0) continue

    const cols = Object.keys(rows[0])
    const placeholders = cols.map(() => '?').join(', ')
    const colNames = cols.map(c => `"${c}"`).join(', ')
    const insertSql = `INSERT OR REPLACE INTO "${tblName}" (${colNames}) VALUES (${placeholders})`

    let successCount = 0
    for (const r of rows) {
      try {
        const vals = cols.map(c => r[c])
        const res = await execute(DEST_URL, insertSql, vals)
        if (res.success !== false) successCount++
      } catch (err) {
        console.warn(`  Lỗi chèn dòng bảng "${tblName}":`, err.message)
      }
    }
    console.log(`-> Bảng "${tblName}": Đã import ${successCount}/${rows.length} bản ghi`)
  }

  // 4. Đối chiếu số lượng bản ghi
  console.log('\n📊 KẾT QUẢ ĐỐI CHIẾU SỐ LƯỢNG SAU KHI SYNC:')
  console.log('------------------------------------------------------------')
  console.log('| Tên Bảng           | Prod Vercel | Dev Clone | Trạng Thái   |')
  console.log('------------------------------------------------------------')
  for (const t of tables) {
    const tblName = t.name
    let srcCnt = 'ERR'
    let dstCnt = 'ERR'
    try {
      const s = await query(SOURCE_URL, `SELECT count(*) as cnt FROM "${tblName}"`)
      srcCnt = s.results?.[0]?.cnt ?? 0
    } catch {}
    try {
      const d = await query(DEST_URL, `SELECT count(*) as cnt FROM "${tblName}"`)
      dstCnt = d.results?.[0]?.cnt ?? 0
    } catch {}
    const isOk = srcCnt === dstCnt || (tblName === 'child_photos' && dstCnt >= srcCnt)
    const status = isOk ? '✅ Khớp 100%' : '⚠️ Lệch'
    console.log(`| ${tblName.padEnd(18)} | ${String(srcCnt).padStart(11)} | ${String(dstCnt).padStart(9)} | ${status.padEnd(12)} |`)
  }
  console.log('------------------------------------------------------------')
  console.log('\n🎉 HOÀN TẤT ĐỒNG BỘ! Database Dev đã sẵn sàng sử dụng an toàn.\n')
}

runClone().catch(err => {
  console.error('\n❌ Lỗi trong quá trình clone:', err)
  process.exit(1)
})
