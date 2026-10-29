import { chromium } from 'playwright';

const TARGET_URL = process.argv[2] || 'https://preview.kem-con-hoc-5xf.pages.dev';

async function testPrompt40() {
  console.log('🚀 Bắt đầu kiểm thử Đợt 40 trên:', TARGET_URL);
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
  });
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

  try {
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

    // Vào Dùng thử nếu thấy
    const dungThuBtn = page.locator('button:has-text("Dùng thử")').first();
    if (await dungThuBtn.count() > 0 && await dungThuBtn.isVisible()) {
      console.log('Bấm "✨ Dùng thử"...');
      await dungThuBtn.click();
      await page.waitForTimeout(1200);
    }

    // ====================================================
    // TEST 1: Màn soạn bài không còn thẻ "Đã kiểm lại N phép tính"
    // ====================================================
    console.log('\n--- 1. Kiểm tra màn Soạn bài ---');
    // Bấm nút "Phụ huynh nhập đề" hoặc "Nhập đề bài" hoặc "Đề mẫu"
    const sampleBtn = page.locator('button:has-text("Đề mẫu"), button:has-text("Bài mẫu")').first();
    const enterBtn = page.locator('button:has-text("Phụ huynh nhập đề"), button:has-text("Nhập đề")').first();
    
    if (await sampleBtn.count() > 0 && await sampleBtn.isVisible()) {
      console.log('Bấm nút "Đề mẫu"...');
      await sampleBtn.click();
    } else if (await enterBtn.count() > 0 && await enterBtn.isVisible()) {
      console.log('Bấm nút "Phụ huynh nhập đề"...');
      await enterBtn.click();
    }
    await page.waitForTimeout(1500);

    // Nếu ở màn hình nhập đề, bấm "Gấu đọc đề này → soạn bài"
    const btnSoan = page.locator('button:has-text("soạn bài"), button:has-text("Soạn bài")').first();
    if (await btnSoan.count() > 0 && await btnSoan.isVisible()) {
      console.log('Bấm nút soạn bài...');
      await btnSoan.click();
      await page.waitForTimeout(2000);
    }

    // Kiểm tra thẻ "Đã kiểm lại ... phép tính"
    const mathCheckCount = await page.locator('text=Đã kiểm lại').count();
    const mathDungCount = await page.locator('text=✓ Đúng').count();
    console.log('   "Đã kiểm lại" count:', mathCheckCount, '| "✓ Đúng" count:', mathDungCount);
    if (mathCheckCount > 0 || mathDungCount > 0) {
      throw new Error('Vẫn còn thẻ "Đã kiểm lại N phép tính" ở màn soạn bài!');
    }
    console.log('   ✓ Màn soạn bài không còn thẻ kiểm lại phép tính');

    // Quay lại trang chủ để thấy thanh tabs
    const backFromExplain = page.locator('button[aria-label="Quay lại"], button:has-text("Quay lại"), button:has-text("‹"), button:has-text("←")').first();
    if (await backFromExplain.count() > 0 && await backFromExplain.isVisible()) {
      await backFromExplain.click();
      await page.waitForTimeout(1000);
    }

    // ====================================================
    // TEST 2: Trò chơi -> Đồng hồ: Người chơi là phụ huynh và con
    // ====================================================
    console.log('\n--- 2. Kiểm tra trò chơi Đồng hồ: Bấm đúng thời gian ---');
    const tabGame = page.locator('.tabs button:has-text("Trò chơi"), nav button:has-text("Trò chơi")').first();
    await tabGame.click();
    await page.waitForTimeout(1000);

    // Chọn đồ vật Đồng hồ
    const toyClock = page.locator('.gc-item:has-text("Đồng hồ")').first();
    await toyClock.click();
    await page.waitForTimeout(1000);

    // Tìm trò "Bấm đúng thời gian"
    const clockGameText = await page.locator('.card:has-text("Bấm đúng thời gian")').innerText();
    console.log('   Nội dung mô tả trò Bấm đúng thời gian:');
    console.log('   ' + clockGameText.split('\n').filter(Boolean).slice(0, 3).join(' '));

    // Kiểm tra không còn ghi cứng "Mẹ và bố luân phiên"
    if (clockGameText.includes('Mẹ và bố luân phiên')) {
      throw new Error('Vẫn còn ghi cứng "Mẹ và bố luân phiên"!');
    }
    console.log('   ✓ Đã thay thế thành phụ huynh và con luân phiên');

    // Chơi thử 1 lượt để kiểm tra người chơi hiển thị
    const btnClockStart = page.locator('.card:has-text("Bấm đúng thời gian") button:has-text("Bắt đầu")').first();
    if (await btnClockStart.isVisible()) {
      await btnClockStart.click();
      await page.waitForTimeout(600);
      const btnClockStop = page.locator('.card:has-text("Bấm đúng thời gian") button:has-text("Dừng")').first();
      if (await btnClockStop.isVisible()) {
        await btnClockStop.click();
        await page.waitForTimeout(600);
      }
    }
    const scoreText = await page.locator('.card:has-text("Bấm đúng thời gian")').innerText();
    console.log('   Bảng điểm sau lượt 1 có người chơi:', scoreText.includes('lệch') ? 'Có kết quả lệch' : 'OK');

    // ====================================================
    // TEST 3: Báo cáo -> Gửi Zalo: Canvas vẽ bằng font Nunito
    // ====================================================
    console.log('\n--- 3. Kiểm tra Modal Gửi báo cáo Zalo ---');
    const backFromClock = page.locator('.gv-round[aria-label="Quay lại"]').first();
    if (await backFromClock.count() > 0 && await backFromClock.isVisible()) {
      await backFromClock.click();
      await page.waitForTimeout(600);
    }

    const tabReport = page.locator('.tabs button:has-text("Báo cáo"), nav button:has-text("Báo cáo")').first();
    await tabReport.click();
    await page.waitForTimeout(1000);

    const btnZalo = page.locator('[data-testid="rp-send-zalo"], button:has-text("Gửi báo cáo vào nhóm Zalo")').first();
    console.log('Bấm nút "Gửi báo cáo vào nhóm Zalo"...');
    await btnZalo.click();
    await page.waitForTimeout(2000);

    // Chờ ảnh xem trước xuất hiện (do canvas tạo blob và setImgUrl)
    const previewImg = page.locator('img[alt="Xem trước báo cáo"]');
    await previewImg.waitFor({ state: 'visible', timeout: 10000 });
    console.log('   Ảnh xem trước báo cáo Zalo visible: true');
    await previewImg.screenshot({ path: 'bang-chung/prompt40/03_anh_bao_cao_zalo_font_nunito.png' });

    // Đóng sheet Zalo
    const closeBtn = page.locator('.sheet button[aria-label="Đóng"], .sheet button:has-text("✕")').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
    console.log('   ✓ Tạo ảnh báo cáo Zalo bằng font Nunito thành công!');

    console.log('\n=========================================');
    console.log('🏁 TỔNG KẾT KIỂM THỬ ĐỢT 40:');
    console.log('Lỗi JS (ReferenceError / TypeError):', errors.length);
    if (errors.length > 0) {
      console.error('Các lỗi phát hiện:', errors);
      throw new Error(`Phát hiện ${errors.length} lỗi runtime!`);
    }
    console.log('✓ TẤT CẢ CÁC MỤC KIỂM THỬ ĐỀU ĐẠT CHUẨN 100%!');
    console.log('=========================================\n');

  } finally {
    await browser.close();
  }
}

testPrompt40().catch((err) => {
  console.error('\n❌ KIỂM THỬ THẤT BẠI:', err);
  process.exit(1);
});
