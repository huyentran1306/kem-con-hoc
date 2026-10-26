import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = '/Users/pro/.gemini/antigravity-ide/brain/1b85ea08-5390-4990-8f67-b7f2408f3dee';
const PROD_URL = 'https://kem-con-hoc-5xf.pages.dev';

async function verify() {
  console.log('🚀 Bắt đầu kiểm thử trực tiếp trên PRODUCTION:', PROD_URL);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // Mobile frame iPhone
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('🔴 CONSOLE ERROR:', msg.text());
      consoleErrors.push(msg.text());
    }
  });

  const pageErrors = [];
  page.on('pageerror', (err) => {
    console.log('🚨 UNCAUGHT PAGE ERROR:', err.message);
    pageErrors.push(err.message);
  });

  // --- BƯỚC 1: Mở trang chủ & kiểm tra asset index-*.js ---
  console.log('\n--- BƯỚC 1: Kiểm tra trang chủ & script index ---');
  await page.goto(PROD_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const scripts = await page.$$eval('script[src]', (els) => els.map((e) => e.getAttribute('src')));
  const indexScript = scripts.find((s) => s.includes('assets/index-'));
  console.log('📦 Tên file index trên trang chủ:', indexScript);

  // --- BƯỚC 2: Vào Chế độ Dùng Thử & Soạn bài ---
  console.log('\n--- BƯỚC 2: Vào Chế độ Dùng Thử & Soạn bài ---');
  const trialBtn = page.locator('button:has-text("Dùng thử không cần tài khoản")');
  if (await trialBtn.isVisible()) {
    await trialBtn.click();
    await page.waitForTimeout(1500);
  }

  // Bấm Gõ đề
  const textBtn = page.locator('button:has-text("Gõ đề")');
  await textBtn.first().click();
  await page.waitForTimeout(1000);

  // Nhập đề bài
  const problemText = 'Mẹ có 18 quả cam, chia đều vào 3 rổ. Mẹ biếu bà 1 rổ. Hỏi mẹ còn lại bao nhiêu quả cam?';
  const textarea = page.locator('textarea');
  await textarea.fill(problemText);
  await page.waitForTimeout(500);

  // Bấm nút "🚀 AI đọc đề này"
  const aiReadBtn = page.locator('button:has-text("AI đọc đề này")');
  await aiReadBtn.click();
  await page.waitForTimeout(1500);

  // Màn Analyze: bấm "Tiếp tục ➔"
  const continueBtn = page.locator('button:has-text("Tiếp tục")');
  await continueBtn.waitFor({ state: 'visible', timeout: 15000 });
  await continueBtn.click();
  console.log('⏳ Đang đợi AI soạn bài...');

  // Đợi xuất hiện màn "Trước khi giảng" (có nút "Bắt đầu hỏi con từng bước")
  const scaffoldBtn = page.locator('button:has-text("Bắt đầu hỏi con từng bước")');
  await scaffoldBtn.waitFor({ state: 'visible', timeout: 30000 });
  console.log('✅ Đã soạn bài thành công! Nút "Bắt đầu hỏi con từng bước" đã xuất hiện.');

  // Chụp ảnh Màn 1: Trước khi giảng
  const shot1Path = path.join(ARTIFACTS_DIR, 'prod_1_truoc_khi_giang.png');
  await page.screenshot({ path: shot1Path, fullPage: true });
  console.log('📸 Đã chụp màn Trước khi giảng:', shot1Path);

  // --- BƯỚC 3: Đi qua các bậc và vào Màn Xong bài ---
  console.log('\n--- BƯỚC 3: Đi qua các bậc & Hoàn thành bài ---');
  await scaffoldBtn.click();
  await page.waitForTimeout(1000);

  // Bấm qua các bậc
  for (let i = 0; i < 5; i++) {
    const nextBtn = page.locator('button:has-text("Bậc tiếp theo"), button:has-text("Con hiểu rồi"), button:has-text("Hoàn thành bài"), button:has-text("Xong bài")');
    if (await nextBtn.isVisible()) {
      const text = await nextBtn.textContent();
      await nextBtn.click();
      await page.waitForTimeout(1000);
      if (text.includes('Hoàn thành') || text.includes('Xong bài')) break;
    }
  }

  // Nếu hiện thẻ "Con dạy lại mẹ" hoặc nút lưu bài
  const finishBtn = page.locator('button:has-text("Hoàn thành bài"), button:has-text("Lưu buổi học & Tặng huy hiệu"), button:has-text("Xong bài")');
  if (await finishBtn.isVisible()) {
    await finishBtn.click();
    await page.waitForTimeout(1500);
  }

  // Kiểm tra màn Xong bài hiện bình thường
  const badgeSelector = page.locator('text=Tặng huy hiệu, text=Gấu gợi ý, text=Kiên nhẫn, text=Sáng tạo').first();
  await badgeSelector.waitFor({ state: 'visible', timeout: 15000 });
  console.log('✅ Màn Xong bài hiện bình thường, có gợi ý huy hiệu, không bị ReferenceError!');

  // Chụp ảnh Màn 2: Xong bài
  const shot2Path = path.join(ARTIFACTS_DIR, 'prod_2_xong_bai.png');
  await page.screenshot({ path: shot2Path, fullPage: true });
  console.log('📸 Đã chụp màn Xong bài:', shot2Path);

  // --- BƯỚC 4: Mở tab Báo cáo ---
  console.log('\n--- BƯỚC 4: Mở tab Báo cáo ---');
  const reportTab = page.locator('nav.tabs button:has-text("Báo cáo"), nav.tabs div:has-text("Báo cáo")');
  await reportTab.click();
  await page.waitForTimeout(2000);

  // Kiểm tra không có màn "Có chút trục trặc"
  const troubleCard = await page.locator('text=Có chút trục trặc nhỏ khi nạp trang này').count();
  console.log('Trục trặc count:', troubleCard);
  if (troubleCard > 0) {
    throw new Error('❌ Báo cáo vẫn còn thẻ trục trặc!');
  }

  // Kiểm tra thẻ Tuần này / Phẩm chất xuất hiện
  const reportHeader = page.locator('text=Tuần này của, text=Phẩm chất').first();
  await reportHeader.waitFor({ state: 'visible', timeout: 10000 });
  console.log('✅ Tab Báo cáo hiện mượt mà!');

  // Chụp ảnh Màn 3: Báo cáo
  const shot3Path = path.join(ARTIFACTS_DIR, 'prod_3_bao_cao.png');
  await page.screenshot({ path: shot3Path, fullPage: true });
  console.log('📸 Đã chụp màn Báo cáo:', shot3Path);

  // --- BƯỚC 5: Kiểm tra console errors ---
  console.log('\n--- BƯỚC 5: Kiểm tra lỗi ReferenceError & TypeError ---');
  const fatalErrors = [...consoleErrors, ...pageErrors].filter(
    (e) => e.includes('ReferenceError') || e.includes('TypeError')
  );
  if (fatalErrors.length > 0) {
    console.error('❌ Phát hiện lỗi fatal trong console:', fatalErrors);
    throw new Error('Console có lỗi ReferenceError/TypeError');
  } else {
    console.log('✅ Console sạch hoàn toàn, không có ReferenceError hay TypeError!');
  }

  await browser.close();
  console.log('\n🎉 TẤT CẢ CÁC BƯỚC KIỂM THỬ TRÊN PRODUCTION ĐỀU ĐẠT 100%!');
}

verify().catch((err) => {
  console.error('LỖI KIỂM THỬ:', err);
  process.exit(1);
});
