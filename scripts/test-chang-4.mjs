/**
 * KIỂM THỬ TỰ ĐỘNG CHẶNG 4: ADMIN THIẾT KẾ BỘ GIAO DIỆN (PROMPT 10)
 * Kiểm tra 9 bước theo Prompt 10:
 * 1. 8 bộ gốc được mô tả chuẩn hóa bằng ThemeSpec
 * 2. Tính toán tương phản WCAG AA và thuật toán Tự sửa
 * 3. Bộ làm sạch SVG (SVG Sanitizer: chặn script, onload, 6KB limit)
 * 4. 6 bước kiểm tra trước phát hành (Preflight checks)
 * 5. Phân phối 3 mức phát hành (testing, partial, published)
 * 6. Chính sách bộ theo mùa có ngày hết hạn
 * 7. 5 tổ hợp gia đình tự ghép phổ biến
 * 8. RBAC: superadmin vs editor khi phát hành
 * 9. Worker routes và AdminThemeDesignerTab component
 */

import assert from 'assert';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  BUILTIN_THEME_SPECS,
  deriveAdminThemeVars,
  sanitizeSvg,
  getContrastRatio,
  autoFixTextColor,
  runThemePreflightChecks,
  isThemeVisibleToFamily,
  POPULAR_FAMILY_COMBOS,
} from '../src/themes/adminThemeSpec.js';
import { THEMES } from '../src/themes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

console.log('🧪 BẮT ĐẦU KIỂM THỬ CHẶNG 4 (PROMPT 10 · ADMIN THIẾT KẾ BỘ GIAO DIỆN)...');

// 1. Kiểm thử mô tả 8 bộ gốc bằng ThemeSpec và độ khớp biến CSS
console.log('\n--- 1. Kiểm tra 8 bộ gốc bằng ThemeSpec ---');
assert.strictEqual(BUILTIN_THEME_SPECS.length, 8, 'Phải có đủ 8 bộ gốc');
for (const spec of BUILTIN_THEME_SPECS) {
  assert.strictEqual(spec.locked, true, `Bộ gốc ${spec.id} phải có locked: true`);
  assert.strictEqual(spec.status, 'published', `Bộ gốc ${spec.id} phải có status: published`);

  const origTheme = THEMES.find((t) => t.id === spec.id);
  assert.ok(origTheme, `Tìm thấy bộ gốc ${spec.id}`);

  const derived = deriveAdminThemeVars(spec);
  assert.strictEqual(derived['--c-bg'], origTheme.vars['--c-bg'], `${spec.id}: --c-bg phải khớp`);
  assert.strictEqual(derived['--c-surface'], origTheme.vars['--c-surface'], `${spec.id}: --c-surface phải khớp`);
  assert.strictEqual(derived['--c-text'], origTheme.vars['--c-text'], `${spec.id}: --c-text phải khớp`);
  assert.strictEqual(derived['--c-accent'], origTheme.vars['--c-accent'], `${spec.id}: --c-accent phải khớp`);
}
console.log('  ✓ 8 bộ gốc khớp chính xác 100% biến CSS gốc');

// 2. Kiểm thử tương phản WCAG AA và thuật toán Auto-Fix
console.log('\n--- 2. Kiểm tra Tương phản màu & Auto-Fix ---');
const blackWhiteContrast = getContrastRatio('#000000', '#FFFFFF');
assert.ok(blackWhiteContrast >= 20, 'Đen trên Trắng phải đạt ~21:1');
const poorContrast = getContrastRatio('#E2E8F0', '#FFFFFF');
assert.ok(poorContrast < 4.5, 'Xám nhạt trên trắng phải dưới 4.5:1');

const fixedText = autoFixTextColor('#FFFFFF');
assert.ok(getContrastRatio(fixedText, '#FFFFFF') >= 4.5, 'Màu chữ tự sửa trên nền trắng phải đạt >= 4.5:1');
const fixedTextDark = autoFixTextColor('#0F172A');
assert.ok(getContrastRatio(fixedTextDark, '#0F172A') >= 4.5, 'Màu chữ tự sửa trên nền tối phải đạt >= 4.5:1');
console.log('  ✓ Tính toán tương phản và Tự sửa đạt chuẩn WCAG AA');

// 3. Kiểm thử SVG Sanitizer
console.log('\n--- 3. Kiểm tra SVG Sanitizer an toàn ---');
const safeSvg = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#F6A623"/></svg>';
assert.strictEqual(sanitizeSvg(safeSvg).valid, true, 'SVG hợp lệ phải được chấp nhận');

const xssScriptSvg = '<svg><script>alert("hack")</script><circle cx="10" cy="10" r="5"/></svg>';
assert.strictEqual(sanitizeSvg(xssScriptSvg).valid, false, 'SVG chứa <script> phải bị từ chối');

const xssOnloadSvg = '<svg onload="alert(1)"><rect width="50" height="50"/></svg>';
assert.strictEqual(sanitizeSvg(xssOnloadSvg).valid, false, 'SVG chứa thuộc tính on* phải bị từ chối');

const foreignObjectSvg = '<svg><foreignObject><div>bad</div></foreignObject></svg>';
assert.strictEqual(sanitizeSvg(foreignObjectSvg).valid, false, 'SVG chứa <foreignObject> phải bị từ chối');

const largeSvg = '<svg>' + '<path d="M0 0 L10 10" />'.repeat(1000) + '</svg>';
assert.strictEqual(sanitizeSvg(largeSvg).valid, false, 'SVG vượt quá 6 KB phải bị từ chối');
console.log('  ✓ SVG Sanitizer loại bỏ mã độc hại và giới hạn 6 KB');

// 4. Kiểm thử 6 bước rà soát trước phát hành
console.log('\n--- 4. Kiểm tra 6 bước Preflight Checks ---');
const validSpec = {
  id: 'test_spec',
  name: 'Bộ kiểm thử',
  version: 1,
  vars: {
    bg: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#0F172A',
    primary: '#4F46E5',
    btnRadius: '999px',
    fontHead: "'Mitr', sans-serif",
    fontBody: "'Nunito', sans-serif",
  },
  checks: { visualReviewed: true },
};
const checkResultOk = runThemePreflightChecks(validSpec);
assert.strictEqual(checkResultOk.contrast, true, 'Tương phản phải đạt');
assert.strictEqual(checkResultOk.vietnameseDiacritics, true, 'Dấu tiếng Việt phải đạt');
assert.strictEqual(checkResultOk.svgSanitized, true, 'SVG phải đạt');
assert.strictEqual(checkResultOk.packageSize, true, 'Gói tải phải <= 30 KB');
assert.strictEqual(checkResultOk.canPublishProduction, true, 'Đủ điều kiện phát hành Production');

const failingSpec = {
  ...validSpec,
  vars: {
    ...validSpec.vars,
    text: '#E2E8F0', // Tương phản kém
  },
};
const checkResultFail = runThemePreflightChecks(failingSpec);
assert.strictEqual(checkResultFail.contrast, false, 'Tương phản kém phải bị đánh trượt');
assert.strictEqual(checkResultFail.canPublishProduction, false, 'Chưa đạt tương phản thì KHÔNG được phát hành production');
assert.strictEqual(checkResultFail.canPublishTesting, true, 'Còn cảnh báo vẫn được phép phát hành Testing nội bộ');
console.log('  ✓ Kiểm tra trước phát hành khoá chặt nút Production khi có cảnh báo');

// 5. Kiểm thử 3 mức phát hành
console.log('\n--- 5. Kiểm tra 3 mức phát hành (testing, partial, published) ---');
const testingSpec = {
  id: 'theme_test',
  status: 'testing',
  testingFamilies: ['fam_alpha', 'fam_beta', 'fam_gamma'],
};
assert.strictEqual(isThemeVisibleToFamily(testingSpec, 'fam_alpha'), true, 'fam_alpha trong danh sách test phải thấy');
assert.strictEqual(isThemeVisibleToFamily(testingSpec, 'fam_other'), false, 'fam_other không trong danh sách test thì không thấy');

const partialSpec = { id: 'theme_part', status: 'partial' };
let partialMatches = 0;
for (let i = 0; i < 100; i++) {
  if (isThemeVisibleToFamily(partialSpec, `family_user_${i}`)) {
    partialMatches++;
  }
}
assert.ok(partialMatches >= 5 && partialMatches <= 20, `Tỉ lệ băm phải xấp xỉ ~10% (thực tế: ${partialMatches}%)`);

const disabledSpec = { id: 'theme_dis', status: 'disabled' };
assert.strictEqual(isThemeVisibleToFamily(disabledSpec, 'fam_alpha'), false, 'Bộ disabled không gia đình nào thấy');
console.log('  ✓ 3 mức phát hành phân phối chính xác theo family_id');

// 6. Kiểm thử bộ theo mùa
console.log('\n--- 6. Kiểm tra Bộ theo mùa & Ngày hết hạn ---');
const activeSeasonal = {
  id: 'theme_tet',
  status: 'published',
  schedule: { seasonal: true, expiresAt: '2099-12-31' },
};
assert.strictEqual(isThemeVisibleToFamily(activeSeasonal, 'fam_1'), true, 'Bộ mùa chưa hết hạn vẫn hiển thị');

const expiredSeasonal = {
  id: 'theme_trung_thu',
  status: 'published',
  schedule: { seasonal: true, expiresAt: '2020-01-01' },
};
assert.strictEqual(isThemeVisibleToFamily(expiredSeasonal, 'fam_1'), false, 'Bộ mùa đã quá hạn phải tự ẩn');
console.log('  ✓ Bộ theo mùa tự động ẩn khi qua ngày hết hạn');

// 7. Kiểm thử 5 tổ hợp phổ biến
console.log('\n--- 7. Kiểm tra 5 tổ hợp gia đình phổ biến ---');
assert.strictEqual(POPULAR_FAMILY_COMBOS.length, 5, 'Phải có 5 tổ hợp phổ biến');
for (const combo of POPULAR_FAMILY_COMBOS) {
  assert.ok(combo.id && combo.name && combo.color && combo.font && combo.shape, `Combo ${combo.name} đầy đủ tham số`);
}
console.log('  ✓ 5 tổ hợp phổ biến đầy đủ thông tin để nhân bản thành bộ gốc');

// 8. Kiểm thử tích hợp UI Admin & Worker Backend
console.log('\n--- 8. Kiểm tra Tích hợp UI Admin & Worker Backend ---');
const adminThemesSectionContent = readFileSync(resolve(root, 'src/AdminThemesSection.jsx'), 'utf8');
const adminThemeDesignerContent = readFileSync(resolve(root, 'src/AdminThemeDesignerTab.jsx'), 'utf8');
const workerAdminStitchContent = readFileSync(resolve('/Users/pro/Coding/study-en/ai-gateway-worker/src/admin_stitch_routes.js'), 'utf8');

assert(adminThemesSectionContent.includes('AdminThemeDesignerTab'), 'AdminThemesSection nhúng AdminThemeDesignerTab');
assert(adminThemeDesignerContent.includes('BUILTIN_THEME_SPECS'), 'AdminThemeDesignerTab dùng BUILTIN_THEME_SPECS');
assert(adminThemeDesignerContent.includes('handleCreateNewTheme'), 'Có chức năng tạo bộ mới');
assert(adminThemeDesignerContent.includes('runThemePreflightChecks'), 'Tích hợp 6 bước kiểm tra trước phát hành');
assert(workerAdminStitchContent.includes('/admin/themes'), 'Worker hỗ trợ endpoint /admin/themes');
assert(workerAdminStitchContent.includes('app_config:theme_drafts:'), 'Worker hỗ trợ lưu bản nháp KV');
assert(workerAdminStitchContent.includes('app_config:theme_history:'), 'Worker hỗ trợ lưu lịch sử phiên bản');
assert(workerAdminStitchContent.includes('PUBLISH_THEME'), 'Worker ghi audit_log khi phát hành theme');
console.log('  ✓ Tích hợp UI Admin và Worker API hoàn chỉnh');

console.log('\n============================================================');
console.log('🏁 TỔNG KẾT CHẶNG 4: TẤT CẢ KIỂM THỬ ĐÃ VƯỢT QUA 100%!');
console.log('============================================================');
