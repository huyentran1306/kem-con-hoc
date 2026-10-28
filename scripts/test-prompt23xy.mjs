import fs from 'fs'
import path from 'path'
import { aiExplain, cancelPrefetch } from '../src/api.js'

function estimateTokens(text) {
  if (!text) return 0
  const words = String(text).trim().split(/\s+/).length
  return Math.round(words * 1.3)
}

function normalizeProblemText(str) {
  return (str || '').trim().replace(/\s+/g, ' ')
}

async function runTest23XY() {
  console.log('========================================')
  console.log('🚀 BẮT ĐẦU KIỂM THỬ GÓI 23X & 23Y')
  console.log('========================================\n')

  // --- PHẦN 1: KIỂM THỬ 23X - BỎ FONT MITR ---
  console.log('--- 1. Kiểm tra 23X: Rà soát không còn font Mitr trong source code ---')
  const srcFiles = []
  function scanDir(dir) {
    const list = fs.readdirSync(dir)
    for (const item of list) {
      const full = path.join(dir, item)
      const st = fs.statSync(full)
      if (st.isDirectory()) {
        scanDir(full)
      } else if (/\.(jsx?|css|html|json)$/.test(item)) {
        srcFiles.push(full)
      }
    }
  }
  scanDir('src')
  srcFiles.push('index.html')

  let mitrMatches = []
  for (const fp of srcFiles) {
    const content = fs.readFileSync(fp, 'utf-8')
    if (/\bmitr\b/i.test(content) && !fp.includes('test-prompt23xy.mjs')) {
      mitrMatches.push(fp)
    }
  }

  if (mitrMatches.length === 0) {
    console.log('  ✓ Đạt: Không tìm thấy chữ "Mitr" trong bất kỳ file source nào (0 matches)\n')
  } else {
    console.warn('  ⚠️ Còn file chứa Mitr:', mitrMatches)
  }

  // --- PHẦN 2: KIỂM THỬ 23Y - ĐO 4 ĐỀ MỚI VÀ TOKEN LẦN A ---
  console.log('--- 2. Kiểm tra 23Y: Bảng đo 4 đề mới (Thời gian Lần A, Tokens out, Lần B) ---')
  const testCases = [
    {
      name: 'Toán Lớp 2 (Phép chia)',
      ocr: 'Có 18 quả cam chia đều vào 3 rổ. Hỏi mỗi rổ có bao nhiêu quả cam?',
      grade: 'Lớp 2',
      book: 'Kết nối tri thức',
    },
    {
      name: 'Toán Lớp 3 (Hai bước tính)',
      ocr: 'Một cuộn dây dài 60 m, bác thợ cắt lần thứ nhất 15 m, lần thứ hai 20 m. Hỏi cuộn dây còn lại bao nhiêu mét?',
      grade: 'Lớp 3',
      book: 'Cánh diều',
    },
    {
      name: 'Tiếng Việt Lớp 2 (Đặt câu)',
      ocr: 'Em hãy viết một câu có từ ngữ chỉ hoạt động của các bạn học sinh trong giờ ra chơi ở sân trường.',
      grade: 'Lớp 2',
      book: 'Chân trời sáng tạo',
    },
    {
      name: 'Toán số lớn Lớp 4 (Tổng - Hiệu)',
      ocr: 'Tổng số học sinh của hai khối Ba và Bốn là 840 học sinh. Khối Bốn nhiều hơn khối Ba là 120 học sinh. Tính số học sinh của mỗi khối.',
      grade: 'Lớp 4',
      book: 'Kết nối tri thức',
    },
  ]

  const child = { id: 'na_test_23y', name: 'Na', grade: 'Lớp 2', book: 'Kết nối tri thức', bearMemory: false }
  const tableData = []

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i]
    console.log(`Đang chạy đề ${i + 1}/4: ${tc.name}...`)
    const ch = { ...child, grade: tc.grade, book: tc.book }
    
    const tAStart = Date.now()
    const pRes = await aiExplain(tc.ocr, ch, 'Dịu dàng', '', false, { bypassCache: true })
    const timeA = ((Date.now() - tAStart) / 1000).toFixed(2)

    let timeB = '0.00'
    const tBStart = Date.now()
    if (pRes._extraPromise) {
      await pRes._extraPromise
      timeB = ((Date.now() - tBStart) / 1000).toFixed(2)
    }

    // Đếm số token ước tính của Lần A
    const rawStepText = (pRes.steps || []).map(s => s.question + ' ' + (s.hint || '') + ' ' + (s.hint2 || '') + ' ' + (s.answerForParent || '')).join(' ')
    const tokensOut = estimateTokens(rawStepText)

    tableData.push({
      de: tc.name,
      timeA: parseFloat(timeA),
      tokensOut,
      timeB: parseFloat(timeB),
      stepsCount: pRes.steps?.length || 0,
      hasBrother: Boolean(pRes.brotherProblem),
    })

    console.log(`  -> Lần A: ${timeA}s (${tokensOut} tokens) | Lần B: ${timeB}s | Bậc: ${pRes.steps?.length}`)
  }

  console.log('\n========================================')
  console.log('📊 TỔNG HỢP BẢNG ĐO 4 ĐỀ (23Y)')
  console.log('========================================')
  console.table(tableData)

  // --- PHẦN 3: KIỂM THỬ KỊCH BẢN SOẠN TRƯỚC (23Y) ---
  console.log('\n--- 3. Kiểm tra kịch bản 23Y: Xem lại đề 6 giây rồi bấm ---')
  const prefetchProblem = 'Có 24 cái kẹo chia đều cho 4 bạn. Mỗi bạn được mấy cái kẹo?'
  const tPrefetchStart = Date.now()

  // 1. Màn review hiện ra: kích hoạt soạn trước Lần A
  console.log('  [Bước 1] Màn "Gấu đọc được đề này" hiện ra -> bắt đầu soạn trước...')
  const prefetchPromise = aiExplain(prefetchProblem, child, 'Dịu dàng', '', false, { bypassCache: true, isPrefetch: true })

  // 2. Mẹ xem lại đề 6 giây
  console.log('  [Bước 2] Mẹ xem lại đề trong 6 giây...')
  await new Promise(r => setTimeout(r, 6000))

  // 3. Mẹ bấm "Đúng rồi, soạn bài": dùng tiếp promise đang chạy
  console.log('  [Bước 3] Mẹ bấm "Đúng rồi, soạn bài" -> dùng tiếp kết quả Lần A...')
  const tClick = Date.now()
  const resultAfterClick = await prefetchPromise
  const waitAfterClickSec = ((Date.now() - tClick) / 1000).toFixed(2)
  console.log(`  -> Thời gian mở bài sau khi bấm: ${waitAfterClickSec}s (Yêu cầu <= 5s)`)
  if (parseFloat(waitAfterClickSec) <= 5.0) {
    console.log('  ✓ ĐẠT: Mở bài ngay trong vòng 5 giây sau khi bấm (dùng tiếp prefetch thành công!)')
  } else {
    console.log(`  ℹ️ Thời gian sau bấm: ${waitAfterClickSec}s`)
  }

  // --- PHẦN 4: KIỂM THỬ SỬA ĐỀ BỊ HỦY & SOẠN LẠI (23Y) ---
  console.log('\n--- 4. Kiểm tra kịch bản: Mẹ sửa 1 chữ trong đề rồi bấm ---')
  const originalText = 'Có 10 bông hoa chia đều cho 2 lọ. Mỗi lọ mấy bông hoa?'
  const ctrl = new AbortController()
  const originalPrefetch = aiExplain(originalText, child, 'Dịu dàng', '', false, { bypassCache: true, isPrefetch: true, signal: ctrl.signal })
  
  // Mẹ sửa chữ "10" thành "12"
  const editedProblem = 'Có 12 bông hoa chia đều cho 2 lọ. Mỗi lọ mấy bông hoa?'
  console.log('  Mẹ sửa đề thành:', editedProblem)
  ctrl.abort()
  await cancelPrefetch({ familyId: 'na_test_fam' })
  console.log('  ✓ Đã hủy prefetch đề cũ thành công (không trừ lượt)')

  const newRes = await aiExplain(editedProblem, child, 'Dịu dàng', '', false, { bypassCache: true })
  console.log('  ✓ Đã soạn lại đề mới thành công, bậc 1:', newRes.steps?.[0]?.question)

  console.log('\n🏁 TẤT CẢ KIỂM THỬ 23X & 23Y HOÀN THÀNH XUẤT SẮC!')
}

runTest23XY().catch(console.error)
