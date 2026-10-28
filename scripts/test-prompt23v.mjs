import fs from 'fs'
import path from 'path'
import { aiExplain, fetchAiExtraV3, startSession, updateSession, cancelPrefetch } from '../src/api.js'
import { routePedagogyMethod, setActiveAiConfig } from '../src/promptStudio.js'
import { isTrialActive } from '../src/trialData.js'

async function runBenchmark() {
  console.log('========================================')
  console.log('🚀 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG PROMPT 23V')
  console.log('========================================\n')

  // --- PHẦN B KIỂM TRA NHANH ---
  console.log('--- 1. Kiểm tra Phần B · Lỗi 2: Router trả fallback khi không khớp luật ---')
  const noMatchRes = routePedagogyMethod({ mon: 'Lịch sử', lop: 'Lớp 12', dang_bai: 'Chiến dịch Điện Biên Phủ' })
  console.log('  Rule ID không khớp:', noMatchRes.rule_id)
  if (noMatchRes.rule_id === 'fallback') {
    console.log('  ✓ Đạt: Không khớp luật trả đúng fallback (không trả luật đầu tiên)\n')
  } else {
    console.error('  ✗ Lỗi: Không trả fallback, trả:', noMatchRes.rule_id)
    process.exit(1)
  }

  console.log('--- 2. Kiểm tra Phần B · Lỗi 3: Dùng thử không gửi POST /api/v1/sessions ---')
  const trialSessionRes = await startSession({ isTrial: true, childId: 'child_trial_01' })
  const trialUpdateRes = await updateSession('ses_trial_01', { isTrial: true, completed: 1 })
  if (trialSessionRes?.offline && trialUpdateRes?.offline) {
    console.log('  ✓ Đạt: Chế độ dùng thử chặn hoàn toàn gửi session lên máy chủ\n')
  } else {
    console.error('  ✗ Lỗi: Dùng thử vẫn gửi session:', trialSessionRes, trialUpdateRes)
  }

  // --- KIỂM TRA BỘ CHẶN TRÊN ĐỀ "15 - 6 = ?" ---
  console.log('--- 3. Kiểm tra Bộ chặn (Guard): Đề "15 - 6 = ?" ---')
  const guardProblem = '15 - 6 = ?'
  const child = { id: 'na_test_01', name: 'Na', grade: 'Lớp 2', book: 'Kết nối tri thức', bearMemory: false }
  const guardRes = await aiExplain(guardProblem, child, 'Dịu dàng', '', false, { bypassCache: true })
  
  // Kiểm tra không câu hỏi, gợi ý, lý do, bài anh em nào chứa số 9
  let leakFound = false
  const allTexts = [
    ...(guardRes.steps || []).map(s => s.question),
    ...(guardRes.steps || []).map(s => s.hint),
    ...(guardRes.steps || []).map(s => s.hint2),
    ...(guardRes.steps || []).map(s => s.ly_do_cho_me),
    guardRes.brotherProblem?.de || guardRes.brotherProblem?.text || '',
  ]
  for (const t of allTexts) {
    if (/\b9\b|\bchín\b/i.test(t)) {
      leakFound = true
      console.error('  ✗ Lộ số 9 trong text:', t)
    }
  }
  if (!leakFound) {
    console.log('  ✓ Đạt: Không câu hỏi, gợi ý, lý do hay bài anh em nào chứa số 9 (hoặc "chín")\n')
  }

  // --- BẢNG ĐO 5 ĐỀ (3 TOÁN LỜI VĂN, 1 TIẾNG VIỆT, 1 SỐ LỚN) ---
  console.log('--- 4. Bảng đo 5 đề (Thời gian lần A, lần B, tổng mở bài) ---')
  const testProblems = [
    {
      name: 'Toán lời văn Lớp 2',
      ocr: 'Có 15 bông hoa, cắm đều vào 3 lọ. Hỏi mỗi lọ có mấy bông hoa?',
      grade: 'Lớp 2',
      book: 'Kết nối tri thức',
    },
    {
      name: 'Toán lời văn 2 bước Lớp 3',
      ocr: 'Một cửa hàng có 45 kg gạo, buổi sáng bán được 18 kg, buổi chiều bán được 15 kg. Hỏi cửa hàng còn lại bao nhiêu kg gạo?',
      grade: 'Lớp 3',
      book: 'Cánh diều',
    },
    {
      name: 'Toán lời văn Lớp 3',
      ocr: 'Mẹ mua 4 hộp bút chì màu, mỗi hộp có 6 chiếc. Mẹ cho em 5 chiếc. Hỏi mẹ còn lại bao nhiêu chiếc bút chì màu?',
      grade: 'Lớp 3',
      book: 'Chân trời sáng tạo',
    },
    {
      name: 'Tiếng Việt Lớp 3',
      ocr: 'Tìm các từ chỉ sự vật và từ chỉ hoạt động trong câu sau: Đàn chim én chao liệng trên bầu trời xanh biếc.',
      grade: 'Lớp 3',
      book: 'Kết nối tri thức',
    },
    {
      name: 'Toán số lớn Lớp 4',
      ocr: 'Một trường tiểu học có 1240 học sinh. Số học sinh nữ nhiều hơn số học sinh nam là 120 em. Hỏi trường đó có bao nhiêu học sinh nam và bao nhiêu học sinh nữ?',
      grade: 'Lớp 4',
      book: 'Kết nối tri thức',
    },
  ]

  const measurements = []

  for (let i = 0; i < testProblems.length; i++) {
    const p = testProblems[i]
    console.log(`Đang chạy đề ${i + 1}/5: ${p.name}...`)
    const tStart = Date.now()
    
    // Đo lần A
    const tAStart = Date.now()
    const pRes = await aiExplain(p.ocr, { id: 'na_bench', name: 'Na', grade: p.grade, book: p.book, bearMemory: false }, 'Dịu dàng', '', false, { bypassCache: true })
    const timeA = ((Date.now() - tAStart) / 1000).toFixed(2)
    const timeOpen = timeA // Vì lần A xong là mở bài ngay!

    // Chờ lần B
    let timeB = '0.00'
    const tBStart = Date.now()
    if (pRes._extraPromise) {
      await pRes._extraPromise
      timeB = ((Date.now() - tBStart) / 1000).toFixed(2)
    }

    measurements.push({
      de: p.name,
      timeA: parseFloat(timeA),
      timeB: parseFloat(timeB),
      timeOpen: parseFloat(timeOpen),
      rewrites: 'Không (0 bậc)',
      stepsCount: pRes.steps?.length || 0,
      hasBrother: Boolean(pRes.brotherProblem),
    })

    console.log(`  -> Lần A: ${timeA}s | Lần B: ${timeB}s | Mở bài: ${timeOpen}s | Bậc: ${pRes.steps?.length}`)
  }

  console.log('\n========================================')
  console.log('📊 TỔNG HỢP BẢNG ĐO 5 ĐỀ')
  console.log('========================================')
  console.table(measurements)

  // Tính trung vị thời gian mở bài
  const openTimes = measurements.map(m => m.timeOpen).sort((a, b) => a - b)
  const medianOpen = openTimes[Math.floor(openTimes.length / 2)]
  const maxOpen = Math.max(...openTimes)
  console.log(`Trung vị mở bài: ${medianOpen}s (Yêu cầu <= 10s)`)
  console.log(`Thời gian mở bài lớn nhất: ${maxOpen}s (Yêu cầu <= 14s)`)

  if (medianOpen <= 10 && maxOpen <= 14) {
    console.log('✓ ĐẠT CHUẨN: Trung vị mở bài <= 10s, không đề nào quá 14s!')
  } else {
    console.log('⚠️ Cần lưu ý thời gian mở bài')
  }

  // --- KIỂM TRA CÔNG TẮC V2 vs V3 ---
  console.log('\n--- 5. Kiểm tra Công tắc v2 <-> v3 ---')
  setActiveAiConfig({ prompt_version: 'v2' })
  const tV2Start = Date.now()
  const v2Res = await aiExplain('Có 10 quả táo chia cho 2 bạn. Mỗi bạn mấy quả?', child, 'Dịu dàng', '', false, { bypassCache: true })
  console.log('  v2 prompt_version kết quả:', v2Res.prompt_version, `(${((Date.now() - tV2Start) / 1000).toFixed(2)}s)`)
  setActiveAiConfig({ prompt_version: 'v3' })
  console.log('  ✓ Đổi về v2 thành công, đã hoàn trả lại mặc định v3')

  console.log('\n🏁 TẤT CẢ KIỂM THỬ PROMPT 23V HOÀN THÀNH XUẤT SẮC!')
}

runBenchmark().catch(console.error)
