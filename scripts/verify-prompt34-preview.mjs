import { chromium } from 'playwright';

const TARGET_URL = process.argv[2] || 'https://preview.kem-con-hoc-5xf.pages.dev';
const SHOT_DIR = process.argv[3] || 'bang-chung/prompt34';

async function testPreview() {
  console.log('🚀 Bắt đầu kiểm thử Đợt 34:', TARGET_URL);
  const browser = await chromium.launch({ headless: true });

  const errors = [];
  const logConsole = (pageName, msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      console.error(`[${pageName} ERROR]`, text);
      if (/ReferenceError|TypeError/i.test(text)) {
        errors.push(`[${pageName}] ${text}`);
      }
    }
  };

  // Test 1: Mobile 390px - Dùng thử bộ Bạn Gấu
  console.log('\n--- Test 1: Mobile 390px (Dùng thử bộ Bạn Gấu) ---');
  const ctxMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    locale: 'vi-VN',
  });
  const page = await ctxMobile.newPage();
  page.on('console', (m) => logConsole('Mobile 390', m));

  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Vào Dùng thử nếu đang ở màn đăng nhập
  const dungThuBtn = page.locator('button:has-text("Dùng thử")').first();
  if (await dungThuBtn.count() > 0 && await dungThuBtn.isVisible()) {
    console.log('Bấm "✨ Dùng thử"...');
    await dungThuBtn.click();
    await page.waitForTimeout(1500);
  }

  // 1.1 Kiểm tra Trang chủ
  const startPhoto = page.locator('[data-testid="start-photo"]');
  await startPhoto.waitFor({ state: 'visible', timeout: 10000 });
  const mainBtnText = await startPhoto.innerText();
  console.log('Nút chính trang chủ:', mainBtnText.replace(/\n/g, ' '));
  if (!mainBtnText.includes('Phụ huynh nhập đề')) {
    throw new Error('Nút chính trang chủ không chứa "Phụ huynh nhập đề"!');
  }

  const goDeCount = await page.locator('button:has-text("Gõ đề bài"), button:has-text("Gõ đề cho")').count();
  const docDeCount = await page.locator('button:has-text("Đọc đề cho Gấu"), button:has-text("Đọc đề cho Người Tuyết")').count();
  const chamVoCardCount = await page.locator('text=AI Chấm vở').count();
  console.log(`Kiểm tra ẩn: Gõ đề count=${goDeCount}, Đọc đề count=${docDeCount}, Thẻ AI Chấm vở count=${chamVoCardCount}`);
  if (goDeCount > 0 || docDeCount > 0 || chamVoCardCount > 0) {
    throw new Error('Trang chủ vẫn còn nút Gõ đề bài, Đọc đề hoặc thẻ AI Chấm vở!');
  }

  // 1.2 Kiểm tra nút nổi Mẹ bình tĩnh & không có nút trên header
  const headerBreathBtn = await page.locator('.top-bar-t3 button:has-text("😮‍💨"), .top-bar-t4 button:has-text("😮‍💨"), .top-bar-km button:has-text("😮‍💨"), header button:has-text("😮‍💨"), [data-testid="btn-calm-corner-t3"], [data-testid="btn-calm-corner-t4"]').count();
  console.log('Nút 😮‍💨 trên header count:', headerBreathBtn);
  if (headerBreathBtn > 0) {
    throw new Error('Vẫn còn nút 😮‍💨 trên header!');
  }

  const calmFab = page.locator('.calm-fab');
  const calmFabVisible = await calmFab.isVisible();
  const calmFabText = await calmFab.innerText();
  console.log(`Nút nổi bình tĩnh: visible=${calmFabVisible}, text="${calmFabText.trim()}"`);
  if (!calmFabVisible || !calmFabText.includes('bình tĩnh')) {
    throw new Error('Không thấy nút nổi Mẹ/Bố bình tĩnh ở góc dưới!');
  }

  // Bấm nút bình tĩnh mở sheet
  await calmFab.click();
  await page.waitForTimeout(500);
  const calmSheetVisible = await page.locator('text=Bình tĩnh').first().isVisible();
  console.log('Bấm nút bình tĩnh mở sheet thành công:', calmSheetVisible);
  // Đóng sheet
  const closeCalm = page.locator('.round-btn:has-text("✕"), [aria-label="Đóng"]').first();
  if (await closeCalm.isVisible()) {
    await closeCalm.click();
  } else {
    await page.keyboard.press('Escape');
  }
  await page.waitForTimeout(500);

  // 1.3 Nhập đề: bấm "Phụ huynh nhập đề"
  console.log('\n--- Test 2: Bấm "Phụ huynh nhập đề" ---');
  await page.locator('[data-testid="start-photo"]').click();
  await page.waitForTimeout(800);

  // Trang nhập đề có nút Gõ đề và Đọc đề
  const nhapDeTitle = await page.innerText('body');
  console.log('Tiêu đề trang nhập đề:', nhapDeTitle.includes('Phụ huynh nhập đề') ? '✓ Có tiêu đề Phụ huynh nhập đề' : 'Không có');

  const btnGoDe = page.locator('button:has-text("Gõ đề")').first();
  await btnGoDe.click();
  await page.waitForTimeout(800);

  // Chip Toán điền đề hộp bút
  const chipToan = page.locator('button:has-text("Toán")').first();
  await chipToan.click();
  await page.waitForTimeout(500);

  const inputText = await page.locator('textarea[data-testid="type-problem-input"]').inputValue();
  console.log('Đề bài khi bấm chip Toán:', inputText);
  if (!inputText.includes('hộp bút')) {
    throw new Error('Đề bài chip Toán không phải đề hộp bút!');
  }

  // Bấm Gấu đọc đề này
  console.log('\n--- Test 3: Gấu đọc đề và vào Hỏi con từng bước ---');
  await page.locator('button:has-text("Gấu đọc đề này")').click();
  await page.waitForTimeout(1000);

  // Màn Đúng rồi soạn bài (hoặc màn Trước khi giảng nếu là đề mẫu có sẵn)
  const confirmBtn = page.locator('button:has-text("Đúng rồi, soạn bài"), button:has-text("Vẫn tiếp tục")');
  if (await confirmBtn.isVisible()) {
    await confirmBtn.click();
  }

  await page.waitForSelector('button:has-text("Bắt đầu hỏi con")', { timeout: 30000 });
  console.log('✓ Đã tới màn Trước khi giảng!');

  await page.locator('button:has-text("Bắt đầu hỏi con")').click();
  await page.waitForTimeout(1500);

  // 1.4 Kiểm tra màn Hỏi con từng bước v2
  console.log('\n--- Test 4: Màn Hỏi con từng bước v2 ---');
  const barText = await page.locator('text=Bậc 1/4').isVisible();
  console.log('Thanh Bậc 1/4 visible:', barText);
  if (!barText) {
    throw new Error('Không thấy thanh "Bậc 1/4"!');
  }

  // Nút Con còn bí & Con làm được
  const btnBi = page.locator('[data-testid="hc-stuck"]');
  const btnLamDuoc = page.locator('[data-testid="hc-done"]');
  console.log('Nút Con còn bí visible:', await btnBi.isVisible());
  console.log('Nút Con làm được visible:', await btnLamDuoc.isVisible());

  // Bấm Con còn bí lần 1 -> Gợi ý 1
  console.log('Bấm "Con còn bí" lần 1...');
  await btnBi.click();
  await page.waitForTimeout(500);
  const hint1El = page.locator('[data-testid="hc-hint-1"]');
  const goiY1Open = await hint1El.innerText();
  console.log('Gợi ý 1 mở:', goiY1Open.replace(/\n/g, ' '));
  if (!goiY1Open.includes('Gợi ý 1')) {
    throw new Error('Gợi ý 1 không mở!');
  }

  // Bấm Con còn bí lần 2 -> Gợi ý 2
  console.log('Bấm "Con còn bí" lần 2...');
  await btnBi.click();
  await page.waitForTimeout(500);
  const hint2El = page.locator('[data-testid="hc-hint-2"]');
  const goiY2Open = await hint2El.innerText();
  console.log('Gợi ý 2 mở:', goiY2Open.replace(/\n/g, ' '));
  if (!goiY2Open.includes('Gợi ý 2')) {
    throw new Error('Gợi ý 2 không mở!');
  }

  // Thử giữ "Đáp án tham khảo" 1.5 giây
  console.log('Giữ Đáp án tham khảo 1.5s...');
  const answerCard = page.locator('[data-testid="hc-answer"]');
  const box = await answerCard.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(1800);
    const holdingClass = await answerCard.getAttribute('class');
    console.log('Lớp của thẻ đáp án khi giữ:', holdingClass);
    await page.mouse.up();
    await page.waitForTimeout(300);
  }

  // Thử Xem đề
  console.log('Bấm "Xem đề"...');
  await page.locator('button:has-text("Xem đề")').click();
  await page.waitForTimeout(500);
  const xemDeVisible = await page.locator('text=Đề bài').first().isVisible();
  console.log('Bảng Xem đề hiển thị:', xemDeVisible);
  await page.locator('.hc-sheet button:has-text("Đóng"), button:has-text("Đóng")').first().click();
  await page.waitForTimeout(500);

  // Đi qua hết các bậc
  console.log('Đi qua hết các bậc đến Xong bài...');
  for (let b = 1; b <= 4; b++) {
    const lamDuoc = page.locator('[data-testid="hc-done"]');
    if (await lamDuoc.isVisible()) {
      await lamDuoc.click();
      await page.waitForTimeout(600);
    }
  }

  // Bấm Hoàn thành bài -> Tặng huy hiệu
  const finishBtn = page.locator('[data-testid="btn-finish-lesson"]');
  await finishBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('Bấm "Hoàn thành bài → Tặng huy hiệu"...');
  await finishBtn.click();
  await page.waitForTimeout(1000);

  // Màn Xong bài
  await page.waitForSelector('.done-container-km', { timeout: 10000 });
  console.log('✓ Đã tới màn Hoàn thành bài / Xong bài!');

  // Kiểm tra không còn dòng "Chấm vở ›" ở Xong bài
  const chamVoXongBai = await page.locator('text=Chấm vở ›').count();
  console.log('Dòng "Chấm vở ›" ở Xong bài count:', chamVoXongBai);
  if (chamVoXongBai > 0) {
    throw new Error('Vẫn còn dòng "Chấm vở ›" ở màn Xong bài!');
  }

  // Test 2: Thử các bộ giao diện: Khu Vườn Đêm (garden), Đêm Tuyết (snow)
  console.log('\n--- Test 5: Kiểm tra các bộ giao diện khác ---');
  for (const theme of ['garden', 'snow']) {
    console.log(`Kiểm tra theme ${theme}...`);
    await page.goto(`${TARGET_URL}?theme=${theme}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const themeBtnText = await page.locator('[data-testid="start-photo"]').innerText();
    console.log(`  [Theme ${theme}] Nút chính:`, themeBtnText.replace(/\n/g, ' '));
    if (!themeBtnText.includes('Phụ huynh nhập đề')) {
      throw new Error(`[Theme ${theme}] Nút chính không có "Phụ huynh nhập đề"!`);
    }
  }

  // Test 3: Màn hình rộng 1440px
  console.log('\n--- Test 6: Desktop 1440px ---');
  const ctxDesktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const pageDesk = await ctxDesktop.newPage();
  pageDesk.on('console', (m) => logConsole('Desktop 1440', m));

  await pageDesk.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  await pageDesk.waitForTimeout(1000);
  const dungThuDesk = pageDesk.locator('button:has-text("Dùng thử")').first();
  if (await dungThuDesk.count() > 0 && await dungThuDesk.isVisible()) {
    await dungThuDesk.click();
    await pageDesk.waitForTimeout(1500);
  }
  const deskStart = pageDesk.locator('[data-testid="start-photo"]');
  await deskStart.waitFor({ state: 'visible', timeout: 10000 });
  const deskBtnText = await deskStart.innerText();
  console.log('  [Desktop 1440] Nút chính:', deskBtnText.replace(/\n/g, ' '));
  if (!deskBtnText.includes('Phụ huynh nhập đề')) {
    throw new Error('[Desktop 1440] Nút chính không có "Phụ huynh nhập đề"!');
  }

  await browser.close();

  console.log('\n=========================================');
  console.log('🏁 TỔNG KẾT KIỂM THỬ ĐỢT 34:');
  console.log('Lỗi JS (ReferenceError / TypeError):', errors.length);
  if (errors.length > 0) {
    console.error('Các lỗi JS:', errors);
    throw new Error('Phát hiện lỗi JS trong console!');
  }
  console.log('✓ TẤT CẢ CÁC MỤC KIỂM THỬ ĐỀU ĐẠT CHUẨN 100%!');
  console.log('=========================================\n');
}

testPreview().catch((err) => {
  console.error('Lỗi kiểm thử preview:', err);
  process.exit(1);
});
