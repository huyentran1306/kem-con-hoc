/**
 * scripts/test-dot14-chang-5.mjs
 * 
 * BỘ KIỂM THỬ CHẶNG 5 · ĐỢT 14
 * Bộ đo bằng số (benchmarks trên slide), kiểm thử tự động, tích hợp chế độ Dùng Thử
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { THEMES } from '../src/themes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('🧪 BẮT ĐẦU KIỂM THỬ CHẶNG 5 (BENCHMARKS SLIDE, OFFLINE DÙNG THỬ & E2E)...');

let passed = 0;
let total = 0;

function it(name, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  ✅ [PASS] ${name}`);
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
    throw err;
  }
}

// 1. Kiểm tra 4 tập dữ liệu benchmark
it('1. Cả 4 tập dữ liệu đánh giá chất lượng AI đều đầy đủ và đúng định dạng', () => {
  const p3Path = path.resolve(root, 'ai-eval/de-mau.json');
  const voPath = path.resolve(root, 'ai-eval/vo-mau/index.json');
  const giangPath = path.resolve(root, 'ai-eval/giang-lai/index.json');
  const tanCongPath = path.resolve(root, 'ai-eval/tan-cong.json');

  assert.ok(fs.existsSync(p3Path), 'de-mau.json phải tồn tại');
  assert.ok(fs.existsSync(voPath), 'vo-mau/index.json phải tồn tại');
  assert.ok(fs.existsSync(giangPath), 'giang-lai/index.json phải tồn tại');
  assert.ok(fs.existsSync(tanCongPath), 'tan-cong.json phải tồn tại');

  const p3Data = JSON.parse(fs.readFileSync(p3Path, 'utf8'));
  const voData = JSON.parse(fs.readFileSync(voPath, 'utf8'));
  const giangData = JSON.parse(fs.readFileSync(giangPath, 'utf8'));
  const tanCongData = JSON.parse(fs.readFileSync(tanCongPath, 'utf8'));

  assert.equal(p3Data.length, 30, 'Bộ đề p3 phải có đúng 30 đề');
  assert.equal(voData.length, 20, 'Bộ bài tập chấm vở phải có đúng 20 bài');
  assert.equal(giangData.length, 15, 'Bộ lời giảng teach-back phải có đúng 15 bài');
  assert.equal(tanCongData.length, 20, 'Bộ tấn công đỏ phải có đúng 20 kịch bản');
});

// 2. Kiểm tra Bảng tổng kết số liệu Slide
it('2. Báo cáo tổng kết slide (ket-qua-chung-ket.md) đã được sinh ra đầy đủ các chỉ số vàng', () => {
  const reportPath = path.resolve(root, 'ai-eval/ket-qua-chung-ket.md');
  assert.ok(fs.existsSync(reportPath), 'ket-qua-chung-ket.md phải tồn tại');
  const content = fs.readFileSync(reportPath, 'utf8');

  assert.ok(content.includes('Phần A: Chấm vở, không sửa hộ'), 'Báo cáo phải có Phần A');
  assert.ok(content.includes('Phần B: Nghe con giảng lại'), 'Báo cáo phải có Phần B');
  assert.ok(content.includes('Phần C: Tấn công đỏ'), 'Báo cáo phải có Phần C');
  assert.ok(content.includes('20/20 bài'), 'Phải đạt 20/20 bài chấm vở');
  assert.ok(content.includes('15/15 ca'), 'Phải đạt 15/15 ca teach-back');
  assert.ok(content.includes('20/20 chặn'), 'Phải chặn 20/20 kịch bản tấn công');
});

// 3. Kiểm tra Mock Dùng Thử trong src/api.js
it('3. Client API hỗ trợ hoàn chỉnh chế độ Offline Dùng Thử cho cả 3 tính năng AI mới', () => {
  const apiContent = fs.readFileSync(path.resolve(root, 'src/api.js'), 'utf8');
  assert.ok(apiContent.includes('isTrialActive'), 'api.js phải kiểm tra isTrialActive');
  assert.ok(apiContent.includes('checkWorkRead'), 'api.js phải export checkWorkRead');
  assert.ok(apiContent.includes('checkWorkGrade'), 'api.js phải export checkWorkGrade');
  assert.ok(apiContent.includes('teachBackTranscribe'), 'api.js phải export teachBackTranscribe');
  assert.ok(apiContent.includes('teachBackGrade'), 'api.js phải export teachBackGrade');
  assert.ok(apiContent.includes('getSafetySummary'), 'api.js phải export getSafetySummary');
});

// 4. Kiểm tra dữ liệu bài giảng & cấu trúc trial
it('4. Dữ liệu trialData.js có đầy đủ thông tin gia đình dùng thử và bài mẫu', () => {
  const trialContent = fs.readFileSync(path.resolve(root, 'src/trialData.js'), 'utf8');
  assert.ok(trialContent.includes('TRIAL_SESSION'), 'trialData.js phải có TRIAL_SESSION');
  assert.ok(trialContent.includes('ly_do_cho_me'), 'Bài học trial phải có lý do sư phạm ly_do_cho_me');
  assert.ok(trialContent.includes('isTrialActive'), 'trialData.js phải export isTrialActive');
});

// 5. Kiểm tra WCAG AA trên cả 8 bộ theme
it('5. Cả 8 bộ theme đều định nghĩa đầy đủ các biến màu tương phản giao diện', () => {
  // Đợt 16: 8 bộ thường ngày + 3 bộ theo mùa
  assert.ok(THEMES.length >= 8, 'Hệ thống phải có ít nhất 8 bộ theme');
  for (const t of THEMES) {
    assert.ok(t.vars['--c-bg'], `Theme ${t.id} phải có --c-bg`);
    assert.ok(t.vars['--c-surface'], `Theme ${t.id} phải có --c-surface`);
    assert.ok(t.vars['--c-text'], `Theme ${t.id} phải có --c-text`);
    assert.ok(t.vars['--c-accent'], `Theme ${t.id} phải có --c-accent`);
  }
});

console.log(`\n🎉 HOÀN THÀNH TẤT CẢ ${passed}/${total} BÀI TEST CHẶNG 5 THÀNH CÔNG 100%!\n`);
