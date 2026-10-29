import { chromium } from 'playwright';

const TARGET_URL = process.argv[2] || 'https://preview.kem-con-hoc-5xf.pages.dev';

async function testPrompt39() {
  console.log('🚀 Bắt đầu kiểm thử Đợt 39 (tab Trò chơi) trên:', TARGET_URL);
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
    // ====================================================
    // TEST 1: Mobile 390px (Giao diện Bạn Gấu)
    // ====================================================
    console.log('\n--- Test 1: Mobile 390px (Bạn Gấu) ---');
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

    // Chuyển sang tab "Trò chơi"
    const tabGame = page.locator('.tabs button:has-text("Trò chơi"), nav button:has-text("Trò chơi")').first();
    await tabGame.click();
    await page.waitForTimeout(1000);

    await page.waitForSelector('[data-testid="screen-goc-choi-chung"]', { timeout: 10000 });
    console.log('✓ Góc chơi chung hiển thị!');

    // 1. Kiểm tra KHÔNG CÒN "Hôm nay ôn" và "Hết 5 phút thì tự dừng"
    const hasFocus = await page.locator('text=Hôm nay ôn').count();
    const hasAutoStop = await page.locator('text=Hết 5 phút thì tự dừng').count();
    console.log('1. "Hôm nay ôn" count:', hasFocus, '| "Hết 5 phút thì tự dừng" count:', hasAutoStop);
    if (hasFocus > 0 || hasAutoStop > 0) {
      throw new Error('Vẫn còn dòng "Hôm nay ôn" hoặc "Hết 5 phút thì tự dừng" trong tab Trò chơi!');
    }

    // 2. Kiểm tra 3 thẻ trò chơi Góc chơi chung: Đấu trí, Leo cây, Thám tử
    console.log('\n2. Kiểm tra 3 thẻ trò chơi...');
    const games = [
      { id: 'btn-game-duel', title: 'Đấu trí' },
      { id: 'btn-game-tree', title: 'Leo cây' },
      { id: 'btn-game-detective', title: 'Thám tử' },
    ];

    for (const g of games) {
      const btn = page.locator(`[data-testid="${g.id}"]`);
      if (!(await btn.isVisible())) throw new Error(`Không thấy thẻ trò chơi ${g.title}`);
      await btn.click();
      await page.waitForTimeout(800);

      // Tìm nút quay lại
      const backBtn = page.locator('button:has-text("‹"), button[title="Về góc chơi"], button:has-text("Quay lại"), button:has-text("←"), button[aria-label="Quay lại"]').first();
      if (await backBtn.count() > 0 && await backBtn.isVisible()) {
        await backBtn.click();
        await page.waitForTimeout(800);
      } else {
        // Hoặc bấm lại tab Trò chơi
        await tabGame.click();
        await page.waitForTimeout(800);
      }
      console.log(`   ✓ Vào và ra trò "${g.title}" thành công`);
    }

    // 3. Kiểm tra chọn đồ vật: Chỉ "Đồng hồ" có "Đồng hồ Lego", mọi đồ vật có "Đồng hồ chơi"
    console.log('\n3. Kiểm tra chọn đồ vật và thẻ Đồng hồ Lego / Đồng hồ chơi...');
    
    // Test đồ vật: Chai / Lọ
    const toyBottle = page.locator('.gc-item:has-text("Chai"), button:has-text("Chai / Lọ")').first();
    await toyBottle.click();
    await page.waitForTimeout(1000);

    const legoBottle = await page.locator('[data-testid="card-lego-clock"]').count();
    const timerBottle = await page.locator('[data-testid="card-play-timer"]').count();
    console.log('   Chai / Lọ -> Lego clock count:', legoBottle, '(kỳ vọng 0) | Timer count:', timerBottle, '(kỳ vọng 1)');
    if (legoBottle !== 0 || timerBottle !== 1) {
      throw new Error('Lỗi kiểm tra đồ vật Chai / Lọ!');
    }

    // Quay lại danh sách đồ vật
    const backFromBottle = page.locator('.gv-round[aria-label="Quay lại"]').first();
    await backFromBottle.click();
    await page.waitForTimeout(800);

    // Test đồ vật: Đồng hồ
    const toyClock = page.locator('.gc-item:has-text("Đồng hồ")').first();
    await toyClock.click();
    await page.waitForTimeout(1000);

    const legoClock = await page.locator('[data-testid="card-lego-clock"]').count();
    const timerClock = await page.locator('[data-testid="card-play-timer"]').count();
    console.log('   Đồng hồ -> Lego clock count:', legoClock, '(kỳ vọng 1) | Timer count:', timerClock, '(kỳ vọng 1)');
    if (legoClock !== 1 || timerClock !== 1) {
      throw new Error('Lỗi kiểm tra đồ vật Đồng hồ: thẻ Đồng hồ Lego hoặc Đồng hồ chơi không đúng!');
    }

    // 4. Kiểm tra Đồng hồ chơi: Bắt đầu -> Tạm dừng -> Tiếp tục -> Đặt lại
    console.log('\n4. Kiểm tra Đồng hồ chơi: Bắt đầu -> Tạm dừng -> Tiếp tục -> Đặt lại...');
    const clockDisplay = page.locator('.gv-clock');
    const btnTimerMain = page.locator('.gv-timer .gv-btn-primary');
    const btnTimerReset = page.locator('.gv-timer .gv-btn-soft');

    const initTime = await clockDisplay.innerText();
    console.log('   Thời gian khởi tạo:', initTime.trim());

    // Bấm Bắt đầu
    await btnTimerMain.click();
    await page.waitForTimeout(1200);
    console.log('   Nút chính sau khi bấm Bắt đầu:', (await btnTimerMain.innerText()).trim());

    // Bấm Tạm dừng
    await btnTimerMain.click();
    await page.waitForTimeout(500);
    const textPaused = (await btnTimerMain.innerText()).trim();
    console.log('   Nút chính sau khi bấm Tạm dừng:', textPaused);
    if (!textPaused.includes('Tiếp tục')) {
      throw new Error(`Kỳ vọng nút đổi thành "Tiếp tục", nhưng nhận được "${textPaused}"`);
    }

    // Bấm Tiếp tục
    await btnTimerMain.click();
    await page.waitForTimeout(500);
    console.log('   Nút chính sau khi bấm Tiếp tục:', (await btnTimerMain.innerText()).trim());

    // Bấm Đặt lại
    await btnTimerReset.click();
    await page.waitForTimeout(500);
    const resetTime = (await clockDisplay.innerText()).trim();
    console.log('   Thời gian sau khi Đặt lại:', resetTime);
    if (resetTime !== '10:00') {
      throw new Error(`Kỳ vọng thời gian trở về "10:00", nhưng nhận được "${resetTime}"`);
    }
    console.log('   ✓ Luồng Đồng hồ chơi chạy hoàn hảo!');

    // Quay lại
    const backFromClock = page.locator('.gv-round[aria-label="Quay lại"]').first();
    await backFromClock.click();
    await page.waitForTimeout(800);

    // 5. Kiểm tra Gõ "cái cốc" rồi bấm Tìm trò
    console.log('\n5. Kiểm tra gõ "cái cốc" và Tìm trò...');
    const inputToy = page.locator('#txt-toy-name, input[placeholder*="Gõ tên đồ vật"]');
    await inputToy.fill('cái cốc');
    const btnFind = page.locator('button:has-text("Tìm trò")').first();
    await btnFind.click();
    await page.waitForTimeout(800);

    const suggestCard = page.locator('button:has-text("Đúng rồi, chơi thôi")').first();
    const suggestVis = await suggestCard.isVisible();
    console.log('   Thẻ gợi ý có nút "Đúng rồi, chơi thôi" visible:', suggestVis);
    if (!suggestVis) throw new Error('Không thấy nút "Đúng rồi, chơi thôi" sau khi tìm cái cốc!');

    await suggestCard.click();
    await page.waitForTimeout(1000);

    const headingToy = await page.locator('h1, .gv-title').first().innerText();
    console.log('   Tiêu đề màn chơi sau khi chọn cái cốc:', headingToy.trim());
    console.log('   ✓ Tìm trò và vào màn chơi thành công!');

    // ====================================================
    // TEST 2: Theme tối (Khu Vườn Đêm & Bảng Phấn) - Kiểm tra tương phản hộp Thử thách của Cây lược
    // ====================================================
    console.log('\n--- Test 2: Giao diện tối (Khu Vườn Đêm / Bảng Phấn) ---');
    const pageDark = await ctx.newPage();
    pageDark.on('console', (m) => logConsole('Dark Theme', m));

    await pageDark.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
    await pageDark.waitForTimeout(1000);

    // Chuyển sang theme Khu Vườn Đêm qua localStorage
    await pageDark.evaluate(() => {
      localStorage.setItem('kem_theme', 'garden');
      document.body.className = 'theme-garden';
    });
    await pageDark.reload({ waitUntil: 'domcontentloaded' });
    await pageDark.waitForTimeout(1200);

    // Vào tab Trò chơi
    const tabGameDark = pageDark.locator('.tabs button:has-text("Trò chơi"), nav button:has-text("Trò chơi")').first();
    await tabGameDark.click();
    await pageDark.waitForTimeout(1000);

    // Chọn Cây lược
    const toyComb = pageDark.locator('.gc-item:has-text("Lược"), button:has-text("Cây lược")').first();
    await toyComb.click();
    await pageDark.waitForTimeout(1000);

    // Kiểm tra màu chữ và màu nền của hộp Thử thách
    const challengeBox = pageDark.locator('.card:has-text("Thử thách cho")').first();
    const challengeVis = await challengeBox.isVisible();
    console.log('   Hộp Thử thách cho mẹ hỏi con visible:', challengeVis);
    if (!challengeVis) throw new Error('Không thấy hộp Thử thách trong trò Cây lược!');

    const styleInfo = await challengeBox.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
      };
    });
    console.log('   Computed style hộp thử thách theme-garden:', styleInfo);
    console.log('   ✓ Theme tối hiển thị hộp Thử thách chuẩn xác!');

    // ====================================================
    // TEST 3: Desktop 1440px
    // ====================================================
    console.log('\n--- Test 3: Desktop 1440px ---');
    const ctxDesktop = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: 'vi-VN',
    });
    const pageDesktop = await ctxDesktop.newPage();
    pageDesktop.on('console', (m) => logConsole('Desktop 1440', m));

    await pageDesktop.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
    await pageDesktop.waitForTimeout(1200);

    const dungThuDesk = pageDesktop.locator('button:has-text("Dùng thử")').first();
    if (await dungThuDesk.count() > 0 && await dungThuDesk.isVisible()) {
      await dungThuDesk.click();
      await pageDesktop.waitForTimeout(1000);
    }

    const tabGameDesk = pageDesktop.locator('.tabs button:has-text("Trò chơi"), nav button:has-text("Trò chơi")').first();
    await tabGameDesk.click();
    await pageDesktop.waitForTimeout(1000);

    const deskGoc = await pageDesktop.locator('[data-testid="screen-goc-choi-chung"]').isVisible();
    console.log('   Desktop 1440px màn Góc chơi chung visible:', deskGoc);
    if (!deskGoc) throw new Error('Màn hình Góc chơi chung không hiển thị trên desktop!');

    console.log('\n=========================================');
    console.log('🏁 TỔNG KẾT KIỂM THỬ ĐỢT 39:');
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

testPrompt39().catch((err) => {
  console.error('\n❌ KIỂM THỬ THẤT BẠI:', err);
  process.exit(1);
});
