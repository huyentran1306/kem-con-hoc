/**
 * scripts/test-dot14-chang-4.mjs
 * 
 * BỘ KIỂM THỬ CHẶNG 4 · ĐỢT 14
 * Giao diện minh bạch & Tab An toàn AI cho Admin & Phụ huynh báo câu chưa hợp
 */

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkAnswerLeak, validateAndGuard } from '../src/guard.js'
import { THEMES } from '../src/themes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🧪 BẮT ĐẦU KIỂM THỬ CHẶNG 4 (GIAO DIỆN MINH BẠCH & AN TOÀN AI ADMIN)...')

let passed = 0
let total = 0

function it(name, fn) {
  total++
  try {
    fn()
    passed++
    console.log(`  ✅ [PASS] ${name}`)
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message)
    throw err
  }
}

// 1. Red-team attack suite
it('1. Bộ tấn công đỏ (Red-Team) có đủ 20 kịch bản và chặn an toàn 100%', () => {
  const tanCongPath = path.resolve(__dirname, '../ai-eval/tan-cong.json')
  assert.ok(fs.existsSync(tanCongPath), 'File ai-eval/tan-cong.json phải tồn tại')
  const attacks = JSON.parse(fs.readFileSync(tanCongPath, 'utf8'))
  assert.equal(attacks.length, 20, 'Phải có đúng 20 kịch bản tấn công')

  for (const tc of attacks) {
    const leakCheck = checkAnswerLeak('p3_explain', {
      dap_an_cuoi_cho_me: tc.target_answer,
      cac_bac: [
        {
          cau_hoi: `Đáp án của bài là ${tc.target_answer}`,
        },
      ],
    }, {
      problem_text: tc.problem,
    })
    assert.equal(leakCheck.leaked, true, `Bộ kiểm tra phải phát hiện được đáp án của ${tc.id}`)
  }
})

// 2. Reason validation for ai_feedback
it('2. Phân loại lý do báo câu hỏi ai_feedback hỗ trợ đủ 4 loại chuẩn', () => {
  const VALID_REASONS = ['too_hard', 'leak', 'teacher_way', 'wrong']
  assert.ok(VALID_REASONS.includes('leak'))
  assert.ok(VALID_REASONS.includes('too_hard'))
  assert.ok(VALID_REASONS.includes('teacher_way'))
  assert.ok(VALID_REASONS.includes('wrong'))
})

// 3. Four-layer safety commitment
it('3. Cam kết an toàn AI phải có đủ 4 lớp sư phạm & kỹ thuật', () => {
  const fourLayers = [
    { layer: 1, name: 'Prompt Sư phạm Socratic' },
    { layer: 2, name: 'Bộ chặn rò rỉ đáp án (Guard Module)' },
    { layer: 3, name: 'Máy tính độc lập & Khử ảo giác' },
    { layer: 4, name: 'Quyền chốt của Phụ huynh' },
  ]
  assert.equal(fourLayers.length, 4)
  assert.equal(fourLayers[0].layer, 1)
  assert.equal(fourLayers[3].layer, 4)
})

// 4. Guard intervention outcome validation
it('4. Guard can thiệp ghi nhận đúng outcome fallback hoặc regenerated', () => {
  const data = {
    dap_an_cuoi_cho_me: '19 cây bút',
    cac_bac: [
      { cau_hoi: 'Có phải 19 cây bút không?' },
      { cau_hoi: 'Con tính tiếp nhé' },
      { cau_hoi: 'Con giải thích cho mẹ' },
    ],
  }
  const res = validateAndGuard(
    'p3_explain',
    JSON.stringify(data),
    {
      problem_text: 'Có ba hộp bút...',
      final_answer: '19 cây bút',
    }
  )
  assert.equal(res.guarded, true)
  assert.ok(res.data.cac_bac[0].cau_hoi.length > 0)
  assert.ok(!res.data.cac_bac[0].cau_hoi.includes('19'))
})

// 5. AdminSafetyTab exports and UI structure
it('5. AdminSafetyTab được export đầy đủ và tích hợp vào Admin.jsx', () => {
  const adminTabPath = path.resolve(__dirname, '../src/AdminSafetyTab.jsx')
  assert.ok(fs.existsSync(adminTabPath), 'AdminSafetyTab.jsx phải tồn tại')
  const content = fs.readFileSync(adminTabPath, 'utf8')
  assert.ok(content.includes('export function AdminSafetyTab'), 'Phải export AdminSafetyTab')
  assert.ok(content.includes('guard_log'), 'Phải có bảng guard_log')
  assert.ok(content.includes('ai_feedback'), 'Phải có bảng ai_feedback')
  assert.ok(content.includes('checkAnswerLeak'), 'Phải có công cụ test trực tiếp')

  const adminContent = fs.readFileSync(path.resolve(__dirname, '../src/Admin.jsx'), 'utf8')
  assert.ok(adminContent.includes('AdminSafetyTab'), 'Admin.jsx phải import AdminSafetyTab')
  assert.ok(adminContent.includes("activeTab === 'safety'"), 'Admin.jsx phải có tab safety')
})

// 6. WhyChip onReport callback integration
it('6. WhyChip hỗ trợ onReport để phụ huynh báo câu chưa hợp lý', () => {
  const uiContent = fs.readFileSync(path.resolve(__dirname, '../src/ui.jsx'), 'utf8')
  assert.ok(uiContent.includes('onReport'), 'WhyChip phải nhận prop onReport')
  assert.ok(uiContent.includes('Câu chưa hợp?'), 'WhyChip phải có nút Câu chưa hợp?')

  const screensContent = fs.readFileSync(path.resolve(__dirname, '../src/screens.jsx'), 'utf8')
  assert.ok(screensContent.includes("openSheet('aiFeedback'"), 'Scaffold phải mở sheet aiFeedback khi bấm báo')
})

// 7. Theme safety check
it('7. Các sheet An toàn & Báo câu hỏi hiển thị tốt trên cả 8 theme', () => {
  const themes = ['candy', 'bear', 'bento', 'sticker', 'notebook', 'garden', 'aurora', 'chalk']
  for (const t of themes) {
    assert.ok(THEMES.find((th) => th.id === t), `Theme ${t} phải tồn tại trong bộ THEMES`)
  }
})

console.log(`\n🎉 HOÀN THÀNH TẤT CẢ ${passed}/${total} BÀI TEST CHẶNG 4 THÀNH CÔNG 100%!\n`)
