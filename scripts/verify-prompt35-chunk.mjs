import { chromium } from 'playwright';

const TARGET_URL = process.argv[2] || 'https://preview.kem-con-hoc-5xf.pages.dev';

async function testChunkReload() {
  console.log('🚀 Bắt đầu kiểm thử Đợt 35 chunk reload trên:', TARGET_URL);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    locale: 'vi-VN',
  });
  const page = await context.newPage();

  // 1. Vào trang và đăng nhập thử nghiệm hoặc dùng thử
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const dungThuBtn = page.locator('button:has-text("Dùng thử")').first();
  if (await dungThuBtn.count() > 0 && await dungThuBtn.isVisible()) {
    console.log('Bấm "✨ Dùng thử"...');
    await dungThuBtn.click();
    await page.waitForTimeout(1500);
  }

  // 2. Chuyển sang tab "Con tôi"
  console.log('Chuyển sang tab "Con tôi"...');
  const conToiTab = page.locator('.tabs button:has-text("Con tôi"), nav button:has-text("Con tôi")').first();
  await conToiTab.click();
  await page.waitForTimeout(1000);

  // 3. Giả lập tình huống lỗi: khi request chunk FamilyMembersSheet-*.js lần đầu, trả về text/html (như Cloudflare Pages khi chunk cũ bị xoá)
  let intercepted = false;
  let reloaded = false;

  page.on('load', () => {
    if (intercepted) {
      console.log('✓ Trang đã tự động reload sau khi phát hiện lỗi tải chunk cũ!');
      reloaded = true;
    }
  });

  await page.route('**/assets/FamilyMembersSheet-*.js', async (route) => {
    if (!intercepted) {
      intercepted = true;
      console.log('⚡ Mô phỏng Cloudflare Pages trả về text/html (404 fallback to index.html) cho chunk cũ:', route.request().url());
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: '<!DOCTYPE html><html><body>Fallback Index HTML</body></html>',
      });
    } else {
      // Sau khi reload, cho phép request bình thường
      console.log('Tải chunk mới bình thường sau reload...');
      await route.continue();
    }
  });

  // 4. Bấm "Thành viên gia đình"
  console.log('Bấm nút "Thành viên gia đình"...');
  const btnThanhVien = page.locator('button:has-text("Thành viên gia đình")').first();
  await btnThanhVien.click();

  // Chờ xem có lỗi "Có lỗi nhỏ khi mở cửa sổ này" hay không, hoặc trang tự reload
  await page.waitForTimeout(3000);

  // Kiểm tra không được có ô lỗi ErrorBoundary "Có lỗi nhỏ khi mở cửa sổ này"
  const errorBoxCount = await page.locator('text="Có lỗi nhỏ khi mở cửa sổ này"').count();
  console.log('Số lượng hộp lỗi "Có lỗi nhỏ":', errorBoxCount);

  if (errorBoxCount > 0) {
    throw new Error('Thất bại: ErrorBoundary vẫn hiện "Có lỗi nhỏ khi mở cửa sổ này"!');
  }

  console.log('✓ Thành công: Không còn lỗi "Có lỗi nhỏ khi mở cửa sổ này"!');
  await browser.close();
}

testChunkReload().catch((err) => {
  console.error('Lỗi kiểm thử chunk reload:', err);
  process.exit(1);
});
