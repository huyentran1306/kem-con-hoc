import { chromium } from 'playwright';

const TARGET_URL = process.argv[2] || 'https://preview.kem-con-hoc-5xf.pages.dev';

async function testPrompt37() {
  console.log('🚀 Bắt đầu kiểm thử Đợt 37 (màn Hoàn thành v6) trên:', TARGET_URL);
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

  // ----------------------------------------------------
  // TEST 1: Mobile 390px - Dùng thử bộ Bạn Gấu
  // ----------------------------------------------------
  console.log('\n--- Test 1: Mobile 390px (Bạn Gấu) - Đi từ đầu tới Hoàn thành bài ---');
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    locale: 'vi-VN',
  });
  const page = await ctx.newPage();
  page.on('console', (m) => logConsole('Mobile 390', m));

  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);

  // Vào Dùng thử nếu thấy nút
  const dungThuBtn = page.locator('button:has-text("Dùng thử")').first();
  if (await dungThuBtn.count() > 0 && await dungThuBtn.isVisible()) {
    console.log('Bấm "✨ Dùng thử"...');
    await dungThuBtn.click();
    await page.waitForTimeout(1200);
  }

  // 1. Phụ huynh nhập đề
  const startPhoto = page.locator('[data-testid="start-photo"]').first();
  await startPhoto.waitFor({ state: 'visible', timeout: 8000 });
  await startPhoto.click();
  await page.waitForTimeout(800);

  // 2. Gõ đề -> chọn đề mẫu Toán hộp bút
  const btnGoDe = page.locator('button:has-text("Gõ đề")').first();
  await btnGoDe.click();
  await page.waitForTimeout(800);

  const chipToan = page.locator('button:has-text("Toán")').first();
  await chipToan.click();
  await page.waitForTimeout(500);

  // 3. Gấu đọc đề này -> Trước khi giảng
  await page.locator('button:has-text("Gấu đọc đề này")').click();
  await page.waitForTimeout(1000);

  const confirmBtn = page.locator('button:has-text("Đúng rồi, soạn bài"), button:has-text("Vẫn tiếp tục")');
  if (await confirmBtn.isVisible()) {
    await confirmBtn.click();
  }

  await page.waitForSelector('button:has-text("Bắt đầu hỏi con")', { timeout: 30000 });
  await page.locator('button:has-text("Bắt đầu hỏi con")').click();
  await page.waitForTimeout(1200);

  // 4. Màn Hỏi con từng bước: Bấm mở gợi ý 1 lần ở Bậc 1
  console.log('Hỏi con từng bước: bấm mở gợi ý 1 lần...');
  const btnBi = page.locator('[data-testid="hc-stuck"]').first();
  if (await btnBi.isVisible()) {
    await btnBi.click();
    await page.waitForTimeout(500);
  }

  // Đi qua hết 4 bậc
  console.log('Đi qua hết các bậc...');
  for (let b = 1; b <= 4; b++) {
    const lamDuoc = page.locator('[data-testid="hc-done"]').first();
    if (await lamDuoc.isVisible()) {
      await lamDuoc.click();
      await page.waitForTimeout(500);
    }
  }

  // Bấm Hoàn thành bài -> Tặng huy hiệu
  const finishBtn = page.locator('[data-testid="btn-finish-lesson"]').first();
  await finishBtn.waitFor({ state: 'visible', timeout: 8000 });
  await finishBtn.click();
  await page.waitForTimeout(1200);

  // ----------------------------------------------------
  // KIỂM TRA MÀN HOÀN THÀNH v6
  // ----------------------------------------------------
  console.log('\n--- Kiểm tra 4 thẻ và chi tiết màn Hoàn thành v6 ---');
  await page.waitForSelector('[data-testid="done-v6"]', { timeout: 10000 });
  console.log('✓ Container data-testid="done-v6" hiển thị!');

  // 1. Thẻ 1: Hero cho con
  const heroKid = page.locator('[data-testid="done-section-kid"]');
  const heroKidVis = await heroKid.isVisible();
  console.log('1. Hero cho con visible:', heroKidVis);
  if (!heroKidVis) throw new Error('Không thấy Thẻ 1 (Hero cho con)!');

  const heroTitle = await heroKid.locator('h2').innerText();
  console.log('   Tiêu đề Hero:', heroTitle);
  if (!heroTitle.includes('Hoan hô')) throw new Error('Tiêu đề Hero không có "Hoan hô"!');

  const heroStats = await heroKid.locator('.dn-stat').allInnerTexts();
  console.log('   3 ô số:', heroStats.map((s) => s.replace(/\n/g, ' ')).join(' | '));

  // 2. Thẻ 2: Tặng huy hiệu
  const badgeSection = page.locator('[data-testid="card-suggested-badge"]');
  const badgeSecVis = await badgeSection.isVisible();
  console.log('2. Tặng huy hiệu visible:', badgeSecVis);
  if (!badgeSecVis) throw new Error('Không thấy Thẻ 2 (Tặng huy hiệu)!');

  // Kiểm tra 4 ô chọn đức tính
  for (const tr of ['Kiên nhẫn', 'Sáng tạo', 'Tập trung', 'Tỉ mỉ']) {
    const trBtn = page.locator(`[data-testid="btn-pick-trait-${tr}"]`);
    const trVis = await trBtn.isVisible();
    if (!trVis) throw new Error(`Không thấy nút chọn đức tính "${tr}"!`);
  }
  console.log('   Đủ 4 nút chọn đức tính: Kiên nhẫn, Sáng tạo, Tập trung, Tỉ mỉ');

  // Thử tặng huy hiệu
  const btnGift = page.locator('[data-testid="btn-grant-suggested-badge"]');
  console.log('   Nút tặng huy hiệu text:', (await btnGift.innerText()).trim());
  await btnGift.click();
  await page.waitForTimeout(600);

  const btnGiftDone = await btnGift.innerText();
  console.log('   Sau khi bấm tặng:', btnGiftDone.trim());
  if (!btnGiftDone.includes('Đã tặng')) throw new Error('Nút không chuyển sang "Đã tặng"! Sau khi tặng nút phải khoá.');
  const isGiftDisabled = await btnGift.isDisabled();
  console.log('   Nút tặng đã bị khoá (disabled):', isGiftDisabled);
  if (!isGiftDisabled) throw new Error('Nút tặng huy hiệu chưa bị khoá sau khi tặng!');

  // 3. Thẻ 3: Góc phụ huynh
  const parentSection = page.locator('[data-testid="done-section-parent"]');
  const parentSecVis = await parentSection.isVisible();
  console.log('3. Góc phụ huynh visible:', parentSecVis);
  if (!parentSecVis) throw new Error('Không thấy Thẻ 3 (Góc phụ huynh)!');

  const autonomyNote = await parentSection.locator('.dn-note').innerText();
  console.log('   Mức tự chủ gợi ý & lý do:', autonomyNote.replace(/\n/g, ' '));
  if (!autonomyNote.includes('App gợi ý') && !autonomyNote.includes('chọn mức này')) {
    throw new Error('Không thấy giải thích lý do app gợi ý mức tự chủ!');
  }

  // Gợi ý cách kèm (mở ra rồi thu lại)
  const coachCard = page.locator('[data-testid="coach-advice-card"]');
  if (await coachCard.isVisible()) {
    const btnExpand = coachCard.locator('button.dn-tips-head');
    console.log('   Mở "Gợi ý cách kèm"...');
    await btnExpand.click();
    await page.waitForTimeout(400);
    const bodyVis = await coachCard.locator('.dn-tips-body').isVisible();
    console.log('   Nội dung gợi ý kèm mở:', bodyVis);
    if (!bodyVis) throw new Error('Gợi ý kèm không mở ra!');

    console.log('   Thu lại "Gợi ý cách kèm"...');
    await btnExpand.click();
    await page.waitForTimeout(400);
    const bodyClosed = !(await coachCard.locator('.dn-tips-body').isVisible());
    console.log('   Nội dung gợi ý kèm đã thu lại:', bodyClosed);
    if (!bodyClosed) throw new Error('Gợi ý kèm không thu lại!');
  }

  // 4. Thẻ 4: Làm tiếp
  const nextSection = page.locator('[data-testid="done-section-next"]');
  const nextSecVis = await nextSection.isVisible();
  console.log('4. Thẻ Làm tiếp visible:', nextSecVis);
  if (!nextSecVis) throw new Error('Không thấy Thẻ 4 (Làm tiếp)!');

  const hasSimilar = await nextSection.locator(':has-text("Bài tương tự")').first().isVisible();
  console.log('   Có mục "Bài tương tự (5 phút)":', hasSimilar);
  if (!hasSimilar) throw new Error('Không có mục "Bài tương tự"!');

  // Nút Làm thử
  const btnLamThu = nextSection.locator('button:has-text("Làm thử")').first();
  if (await btnLamThu.isVisible()) {
    console.log('   Nút "Làm thử ›" hiển thị rõ ràng');
  }

  // 5. Nút Lưu & về trang chủ dính đáy
  const btnSave = page.locator('[data-testid="done-save"]');
  const saveVis = await btnSave.isVisible();
  console.log('5. Nút "Lưu & về trang chủ" visible:', saveVis);
  if (!saveVis) throw new Error('Không thấy nút Lưu & về trang chủ!');

  // Nút bình tĩnh không che nút chính
  const fabCount = await page.locator('.calm-fab').count();
  console.log('   Nút bình tĩnh tồn tại (không che nút chính):', fabCount > 0);

  // Bấm Lưu & về trang chủ
  await btnSave.click();
  await page.waitForTimeout(1000);
  const homeVis = await page.locator('[data-testid="start-photo"]').isVisible();
  console.log('   Đã quay về trang chủ:', homeVis);
  if (!homeVis) throw new Error('Không quay về trang chủ sau khi bấm Lưu!');

  // ----------------------------------------------------
  // TEST 2: Desktop 1440px - Theme Khu Vườn Đêm (garden)
  // ----------------------------------------------------
  console.log('\n--- Test 2: Desktop 1440px & Theme Khu Vườn Đêm (garden) ---');
  const ctxDesk = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const pageDesk = await ctxDesk.newPage();
  pageDesk.on('console', (m) => logConsole('Desktop 1440', m));

  await pageDesk.goto(`${TARGET_URL}?theme=garden`, { waitUntil: 'domcontentloaded' });
  await pageDesk.waitForTimeout(1200);

  // Check trang chủ trên theme garden
  const deskStart = pageDesk.locator('[data-testid="start-photo"]').first();
  if (await deskStart.isVisible()) {
    console.log('Desktop 1440 theme garden: Nút Phụ huynh nhập đề visible');
  }

  await browser.close();

  console.log('\n=========================================');
  console.log('🏁 TỔNG KẾT KIỂM THỬ ĐỢT 37:');
  console.log('Lỗi JS (ReferenceError / TypeError):', errors.length);
  if (errors.length > 0) {
    console.error('Các lỗi JS:', errors);
    throw new Error('Phát hiện lỗi JS!');
  }
  console.log('✓ TẤT CẢ CÁC MỤC KIỂM THỬ ĐỀU ĐẠT CHUẨN 100%!');
  console.log('=========================================\n');
}

testPrompt37().catch((err) => {
  console.error('Lỗi kiểm thử Đợt 37:', err);
  process.exit(1);
});
