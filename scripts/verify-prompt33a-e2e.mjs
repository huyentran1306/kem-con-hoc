import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const PROD_URL = 'https://kem-con-hoc-5xf.pages.dev';
const OUT_DIR = path.resolve('bang-chung/prompt33a');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Bắt đầu kiểm thử E2E Prompt 33A trên Chromium Incognito...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--incognito', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
    locale: 'vi-VN',
  });

  const page = await context.newPage();

  const consoleLogs = [];
  const corsErrors = [];
  const failedRequests = [];
  let isOfflineTest = false;

  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    // Bắt lỗi CORS thật sự từ trình duyệt (Chromium: "has been blocked by CORS policy")
    if (/has been blocked by CORS policy/i.test(text)) {
      console.error('🚨 BROWSER CORS ERROR in console:', text);
      corsErrors.push(text);
    }
  });

  page.on('requestfailed', (req) => {
    const failure = req.failure();
    const url = req.url();
    if (!isOfflineTest) {
      console.warn('⚠️ Request failed:', url, failure?.errorText);
      failedRequests.push({ url, error: failure?.errorText });
    }
  });

  page.on('response', (res) => {
    const url = res.url();
    if (url.includes('/chat') || url.includes('/api/v1/')) {
      const allowHeaders = res.headers()['access-control-allow-headers'];
      console.log(`[HTTP ${res.status()}] ${res.request().method()} ${url.split('?')[0]}`);
      if (allowHeaders) {
        console.log(`  Access-Control-Allow-Headers: ${allowHeaders}`);
      }
    }
  });

  // Step 1: Đi tới trang production
  console.log('\n--- 1. Mở trang:', PROD_URL);
  await page.goto(PROD_URL, { waitUntil: 'networkidle', timeout: 30000 });

  const scriptSrc = await page.evaluate(() => {
    const s = document.querySelector('script[src*="index-"]');
    return s ? s.getAttribute('src') : null;
  });
  console.log('📦 Bundle đang chạy:', scriptSrc);

  // Step 2: Đăng nhập gia đình thử nghiệm (GiaDinhThuNghiem33A)
  console.log('\n--- 2. Đăng nhập GiaDinhThuNghiem33A...');
  const nameInput = page.locator('input.field').first();
  await nameInput.fill('GiaDinhThuNghiem33A');
  const passInput = page.locator('input[type="password"]');
  await passInput.fill('Password@123');

  const loginBtn = page.locator('button:has-text("Vào app")');
  await loginBtn.click();
  await page.waitForTimeout(2500);

  // Xử lý Onboarding nếu có
  const onbName = page.locator('input[data-testid="onb-child-name"]');
  if (await onbName.count() > 0 && await onbName.isVisible()) {
    console.log('Điền thông tin Onboarding...');
    const meOpt = page.locator('.opt:has-text("Mẹ")').first();
    if (await meOpt.isVisible()) await meOpt.click();
    await onbName.fill('Bé Bơ');
    const finishBtn = page.locator('button[data-testid="onb-finish"]');
    await finishBtn.click();
    await page.waitForTimeout(2000);
  }

  console.log('Đã vào trang chủ!');
  const startTypeBtn = page.locator('[data-testid="start-type"], button:has-text("Gõ đề bài")').first();
  await startTypeBtn.waitFor({ state: 'visible', timeout: 15000 });

  // Step 3: Soạn đề Toán
  console.log('\n--- 3. Soạn đề Toán...');
  await startTypeBtn.click();
  await page.waitForTimeout(1000);

  const textarea = page.locator('textarea[data-testid="type-problem-input"], textarea.ta');
  await textarea.fill('Bác Ba có 45 quả trứng, bác bán đi 18 quả, sau đó mua thêm 12 quả. Hỏi bác Ba có bao nhiêu quả trứng?');

  const submitProblemBtn = page.locator('button:has-text("Gấu đọc đề này")');
  await submitProblemBtn.click();
  await page.waitForTimeout(2000);

  console.log('Xác nhận đề: bấm "Đúng rồi, soạn bài"...');
  const confirmBtn = page.locator('button:has-text("Đúng rồi, soạn bài"), button:has-text("Vẫn tiếp tục")');
  await confirmBtn.waitFor({ state: 'visible', timeout: 10000 });
  await confirmBtn.click();

  console.log('Chờ AI soạn bài và chuyển sang Explain...');
  await page.waitForSelector('button:has-text("Bắt đầu hỏi con")', { timeout: 45000 });
  console.log('✓ Đã tới màn Trước khi giảng (Explain)!');

  const startScaffoldBtn = page.locator('button:has-text("Bắt đầu hỏi con")');
  await startScaffoldBtn.click();
  await page.waitForTimeout(2500);

  console.log('✓ Đã vào màn Hỏi con từng bước (Scaffold)!');
  const scaffoldPath = path.join(OUT_DIR, '01_math_scaffold_clean_console.png');
  await page.screenshot({ path: scaffoldPath, fullPage: true });
  console.log('📸 Đã chụp:', scaffoldPath);

  // Step 4: Thử Hỏi Gấu trong bài
  console.log('\n--- 4. Thử Hỏi Gấu trong bài...');
  const momDrawerBtn = page.locator('button:has-text("Dành cho mẹ"), button:has-text("Mẹ"), button:has-text("Gợi ý cho mẹ")').first();
  if (await momDrawerBtn.count() > 0 && await momDrawerBtn.isVisible()) {
    await momDrawerBtn.click();
    await page.waitForTimeout(1000);
  }

  const askInput = page.locator('input[placeholder*="VD: con chưa học"]');
  if (await askInput.count() > 0 && await askInput.isVisible()) {
    await askInput.fill('Con chưa hiểu vì sao phải trừ trước');
    const askBearBtn = page.locator('button:has-text("Hỏi Gấu")');
    await askBearBtn.click();
    await page.waitForTimeout(4000);
    const askPath = path.join(OUT_DIR, '02_ask_bear.png');
    await page.screenshot({ path: askPath, fullPage: true });
    console.log('📸 Đã chụp Hỏi Gấu:', askPath);

    const backBtn = page.locator('button:has-text("Quay lại"), button:has-text("Đóng"), button:has-text("✕")').first();
    if (await backBtn.count() > 0 && await backBtn.isVisible()) {
      await backBtn.click();
      await page.waitForTimeout(800);
    }
  }

  // Step 5: Thử vào màn Chấm vở
  console.log('\n--- 5. Về trang chủ & Thử vào màn Chấm vở...');
  await page.goto(PROD_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const checkWorkEntry = page.getByText('Chấm vở ngay').first();
  if (await checkWorkEntry.count() > 0 && await checkWorkEntry.isVisible()) {
    await checkWorkEntry.click();
    await page.waitForTimeout(2000);
    const checkWorkPath = path.join(OUT_DIR, '03_check_work.png');
    await page.screenshot({ path: checkWorkPath, fullPage: true });
    console.log('📸 Đã chụp Chấm vở:', checkWorkPath);

    const sampleBtn = page.getByText('Dùng bài làm mẫu').first();
    if (await sampleBtn.count() > 0 && await sampleBtn.isVisible()) {
      await sampleBtn.click();
      console.log('Đã bấm Dùng bài làm mẫu, chờ AI chấm...');
      await page.waitForTimeout(6000);
      const gradedPath = path.join(OUT_DIR, '03b_check_work_graded.png');
      await page.screenshot({ path: gradedPath, fullPage: true });
      console.log('📸 Đã chụp kết quả Chấm vở:', gradedPath);
    }
  }

  // Step 6: Soạn một đề mẫu Tiếng Việt
  console.log('\n--- 6. Về trang chủ & Soạn đề mẫu Tiếng Việt...');
  await page.goto(PROD_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const startTypeBtn2 = page.locator('[data-testid="start-type"], button:has-text("Gõ đề bài")').first();
  await startTypeBtn2.click();
  await page.waitForTimeout(1000);

  const tvChip = page.locator('button:has-text("Tiếng Việt")');
  if (await tvChip.count() > 0 && await tvChip.isVisible()) {
    await tvChip.click();
    await page.waitForTimeout(500);
  }

  const submitProblemBtn2 = page.locator('button:has-text("Gấu đọc đề này")');
  await submitProblemBtn2.click();
  await page.waitForTimeout(2000);

  const confirmBtn2 = page.locator('button:has-text("Đúng rồi, soạn bài"), button:has-text("Vẫn tiếp tục")');
  await confirmBtn2.waitFor({ state: 'visible', timeout: 10000 });
  await confirmBtn2.click();

  console.log('Đã gửi đề Tiếng Việt tới AI (/chat), chờ AI soạn bài...');
  await page.waitForSelector('button:has-text("Bắt đầu hỏi con")', { timeout: 45000 });
  console.log('✓ Đã tới màn Trước khi giảng đề Tiếng Việt!');

  await page.locator('button:has-text("Bắt đầu hỏi con")').click();
  await page.waitForTimeout(2500);

  const tvScaffoldPath = path.join(OUT_DIR, '04_vietnamese_scaffold.png');
  await page.screenshot({ path: tvScaffoldPath, fullPage: true });
  console.log('📸 Đã chụp Tiếng Việt Scaffold:', tvScaffoldPath);

  // Step 7: Kiểm thử khi tắt mạng (Offline test)
  console.log('\n--- 7. Kiểm thử khi tắt mạng (Offline test)...');
  await page.goto(PROD_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const startTypeBtn3 = page.locator('[data-testid="start-type"], button:has-text("Gõ đề bài")').first();
  await startTypeBtn3.click();
  await page.waitForTimeout(1000);

  const textarea3 = page.locator('textarea[data-testid="type-problem-input"], textarea.ta');
  await textarea3.fill('Một người đi bộ được 12km trong 3 giờ. Hỏi mỗi giờ người đó đi được bao nhiêu km?');

  // BẬT CHẾ ĐỘ OFFLINE TRƯỚC KHI BẤM SOẠN
  console.log('🔌 Ngắt mạng (setOffline true)...');
  isOfflineTest = true;
  await context.setOffline(true);

  // Bấm "Gấu đọc đề này" khi offline
  const submitBtn3 = page.locator('button:has-text("Gấu đọc đề này")');
  await submitBtn3.click();
  await page.waitForTimeout(1000);

  const confirmBtn3 = page.locator('button:has-text("Đúng rồi, soạn bài"), button:has-text("Vẫn tiếp tục")');
  if (await confirmBtn3.count() > 0 && await confirmBtn3.isVisible()) {
    await confirmBtn3.click();
  }
  console.log('Đã bấm soạn bài khi đang offline, chờ màn thông báo lỗi...');

  // Đợi xuất hiện thông báo lỗi
  await page.waitForSelector('text=Gấu chưa soạn được bài này', { timeout: 15000 });
  console.log('✓ Đã hiện màn "Gấu chưa soạn được bài này" (không trắng màn hình)!');

  const retryBtn = page.locator('button:has-text("Thử lại")');
  const homeBtn = page.locator('button:has-text("Về trang chủ")');
  console.log('Có nút Thử lại:', (await retryBtn.count()) > 0);
  console.log('Có nút Về trang chủ:', (await homeBtn.count()) > 0);

  // Chụp ảnh màn báo lỗi khi tắt mạng
  const offlinePath = path.join(OUT_DIR, '05_offline_error_screen_not_white.png');
  await page.screenshot({ path: offlinePath, fullPage: true });
  console.log('📸 Đã chụp màn lỗi khi tắt mạng:', offlinePath);

  // Phục hồi mạng
  await context.setOffline(false);
  isOfflineTest = false;

  // Kiểm tra tổng kết lỗi
  console.log('\n=========================================');
  console.log('📊 TỔNG KẾT KIỂM THỬ:');
  console.log('Số lỗi CORS thực sự từ trình duyệt:', corsErrors.length);
  console.log('Số request thất bại ngoài test offline:', failedRequests.length);
  console.log('=========================================\n');

  await browser.close();

  if (corsErrors.length > 0) {
    throw new Error('Phát hiện lỗi CORS: ' + corsErrors.join('; '));
  }

  return {
    corsErrors,
    scriptSrc
  };
}

run().catch((err) => {
  console.error('Lỗi kiểm thử E2E:', err);
  process.exit(1);
});
