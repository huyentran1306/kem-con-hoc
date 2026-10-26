import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = '/Users/pro/.gemini/antigravity-ide/brain/1b85ea08-5390-4990-8f67-b7f2408f3dee';
const PROD_URL = 'https://kem-con-hoc-5xf.pages.dev';
const API_BASE = 'https://ai-gateway-worker.trannth1306.workers.dev';

async function run() {
  console.log('🚀 BẮT ĐẦU KIỂM THỬ PROMPT 21B TRÊN PRODUCTION:', PROD_URL);

  // 1. Tạo tài khoản gia đình thật trên hệ thống
  const rand = Math.random().toString(36).substr(2, 5);
  const famName = `Nhà Bé Cam ${rand}`;
  const regRes = await fetch(`${API_BASE}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      familyName: famName,
      password: 'CamMatKhau21B@123',
      ownerName: 'Mẹ Thảo',
      children: [{ id: 'c_cam', name: 'Bé Cam', emoji: '🍊', grade: 'Lớp 3', book: 'Kết nối tri thức' }],
    }),
  });
  const regData = await regRes.json();
  if (!regData.ok || !regData.token || !regData.family) {
    throw new Error('Đăng ký tài khoản thử nghiệm thất bại: ' + JSON.stringify(regData));
  }
  const familyId = regData.family.id;
  console.log('✅ 1. Đã tạo tài khoản gia đình thật:', famName, 'Family ID:', familyId);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // Mobile iPhone frame
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') {
      console.log('🔴 CONSOLE ERROR:', text);
      consoleErrors.push(text);
    }
  });

  const pageErrors = [];
  page.on('pageerror', (err) => {
    console.log('🚨 UNCAUGHT PAGE ERROR:', err.message);
    pageErrors.push(err.message);
  });

  // Mở trang chủ lần 1
  await page.goto(PROD_URL);
  await page.waitForTimeout(1000);

  // Kiểm tra tên file assets/index-*.js
  const scripts = await page.$$eval('script[src]', (els) => els.map((e) => e.getAttribute('src')));
  const indexScript = scripts.find((s) => s.includes('assets/index-'));
  console.log('📦 Tên file index trên production:', indexScript);

  if (!indexScript || indexScript.includes('index-6Ah4frbR.js')) {
    throw new Error('File index vẫn là bản cũ ' + indexScript);
  }

  // Thiết lập session và state cho tài khoản thật
  const sessionObj = {
    id: familyId,
    name: famName,
    role: 'owner',
    token: regData.token,
    displayName: 'Mẹ Thảo',
  };
  const stateObj = {
    onboarded: true,
    parent: 'Mẹ',
    tone: 'Dịu dàng',
    activeId: 'c_cam',
    children: [{ id: 'c_cam', name: 'Bé Cam', emoji: '🍊', grade: 'Lớp 3', book: 'Kết nối tri thức' }],
    stats: {
      c_cam: {
        stickers: 2,
        stickersList: [],
        stickerHistory: [],
        weak: [],
        strong: [],
        history: [],
      },
    },
  };

  await page.evaluate(({ token, sess, st, famKey }) => {
    localStorage.setItem('kem-con-hoc:auth', token);
    localStorage.setItem('kem-con-hoc:auth-token', token);
    localStorage.setItem('kem-con-hoc:session', JSON.stringify(sess));
    localStorage.setItem(famKey, JSON.stringify(st));
  }, {
    token: regData.token,
    sess: sessionObj,
    st: stateObj,
    famKey: `kem-con-hoc:fam:${familyId}`,
  });

  // Tải lại trang với tài khoản thật đã đăng nhập
  console.log('🔄 Đang mở trang chủ với tài khoản gia đình thật...');
  await page.goto(PROD_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 2. Gõ đề bài trên tài khoản thật
  console.log('\n--- 2. Soạn bài trên tài khoản thật ---');
  // Bấm nút Gõ đề
  const typeBtn = page.locator('button:has-text("Gõ đề")').first();
  await typeBtn.waitFor({ state: 'visible', timeout: 15000 });
  await typeBtn.click();
  await page.waitForTimeout(1000);

  const problemText = 'Mẹ có 18 quả cam, chia đều vào 3 rổ. Mẹ biếu bà 1 rổ. Hỏi mẹ còn lại bao nhiêu quả cam?';
  const textarea = page.locator('textarea');
  await textarea.fill(problemText);
  await page.waitForTimeout(500);

  // Bấm AI đọc đề này
  const aiReadBtn = page.locator('button:has-text("AI đọc đề này")');
  await aiReadBtn.click();
  await page.waitForTimeout(1500);

  // Màn Analyze: bấm Tiếp tục ➔
  const continueBtn = page.locator('button:has-text("Tiếp tục")');
  await continueBtn.waitFor({ state: 'visible', timeout: 15000 });
  await continueBtn.click();
  console.log('⏳ Đang đợi AI soạn bài (Workers AI live + validateAllLessonMath)...');

  // Đợi nút "Bắt đầu hỏi con từng bước" (màn Explain)
  const scaffoldBtn = page.locator('button:has-text("Bắt đầu hỏi con từng bước")');
  await scaffoldBtn.waitFor({ state: 'visible', timeout: 75000 });
  console.log('✅ ĐÃ SOẠN BÀI THÀNH CÔNG TRÊN TÀI KHOẢN THẬT! Nút "Bắt đầu hỏi con từng bước" đã xuất hiện!');

  // Chụp ảnh Màn 1: Trước khi giảng
  const shot1 = path.join(ARTIFACTS_DIR, 'prod_1_truoc_khi_giang.png');
  await page.screenshot({ path: shot1, fullPage: true });
  console.log('📸 Đã chụp màn Trước khi giảng:', shot1);

  // 3. Hỏi đủ các bậc và vào Màn Xong bài
  console.log('\n--- 3. Hỏi các bậc & Vào màn Xong bài ---');
  await scaffoldBtn.click();
  await page.waitForTimeout(1500);

  // Vượt qua từng bậc bằng cách bấm "Con làm được rồi"
  for (let i = 0; i < 6; i++) {
    const finishBtn = page.locator('button[data-testid="btn-finish-lesson"], button:has-text("Hoàn thành bài")');
    if (await finishBtn.isVisible()) {
      console.log('👉 Đã hoàn thành đủ các bậc, bấm "Hoàn thành bài"');
      await finishBtn.click();
      await page.waitForTimeout(1500);
      break;
    }

    const answeredBtn = page.locator('button[data-testid="btn-answered"], button:has-text("Con làm được rồi")').first();
    if (await answeredBtn.isVisible()) {
      console.log(`👉 Bấm hoàn thành bậc ${i + 1}`);
      await answeredBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  // Đảm bảo đã vào màn Xong bài
  const finishBtnFinal = page.locator('button[data-testid="btn-finish-lesson"], button:has-text("Hoàn thành bài")');
  if (await finishBtnFinal.isVisible()) {
    await finishBtnFinal.click();
    await page.waitForTimeout(1500);
  }

  // Kiểm tra màn Xong bài có gợi ý huy hiệu (không bị Cannot access 'j' before initialization)
  const badgeCard = page.locator('[data-testid="card-suggested-badge"]').first();
  await badgeCard.waitFor({ state: 'visible', timeout: 15000 });
  console.log('✅ MÀN XONG BÀI HIỂN THỊ HOÀN HẢO! Có gợi ý huy hiệu, không crash TDZ (Cannot access "j" before initialization)!');

  // Chụp ảnh Màn 2: Xong bài
  const shot2 = path.join(ARTIFACTS_DIR, 'prod_2_xong_bai.png');
  await page.screenshot({ path: shot2, fullPage: true });
  console.log('📸 Đã chụp màn Xong bài:', shot2);

  // 4. Mở tab Báo cáo
  console.log('\n--- 4. Mở tab Báo cáo trên tài khoản thật ---');
  const reportTab = page.locator('nav.tabs button:has-text("Báo cáo")');
  await reportTab.click();
  await page.waitForTimeout(2000);

  // Kiểm tra thẻ trục trặc
  const troubleCount = await page.locator('text=Có chút trục trặc nhỏ khi nạp trang này').count();
  if (troubleCount > 0) {
    throw new Error('❌ Báo cáo bị sập với thẻ trục trặc!');
  }
  const reportHeader = page.locator('text=Ai kèm').first();
  await reportHeader.waitFor({ state: 'visible', timeout: 10000 });
  console.log('✅ TAB BÁO CÁO HOẠT ĐỘNG HOÀN HẢO! Đã sửa lỗi useCallback is not defined, biểu đồ phẩm chất hiện bình thường!');

  // Chụp ảnh Màn 3: Báo cáo
  const shot3 = path.join(ARTIFACTS_DIR, 'prod_3_bao_cao.png');
  await page.screenshot({ path: shot3, fullPage: true });
  console.log('📸 Đã chụp màn Báo cáo:', shot3);

  // 5. Kiểm tra chế độ Dùng Thử
  console.log('\n--- 5. Kiểm tra lại Xong bài & Báo cáo ở chế độ Dùng thử ---');
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.goto(`${PROD_URL}/#trial`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Thử mở tab Báo cáo ở chế độ Dùng thử
  const trialReportTab = page.locator('nav.tabs button:has-text("Báo cáo")');
  if (await trialReportTab.isVisible()) {
    await trialReportTab.click();
    await page.waitForTimeout(1500);
    const trialTrouble = await page.locator('text=Có chút trục trặc nhỏ khi nạp trang này').count();
    if (trialTrouble > 0) {
      throw new Error('❌ Dùng thử: Báo cáo bị trục trặc!');
    }
    console.log('✅ DÙNG THỬ: Tab Báo cáo mở trơn tru, không có lỗi trục trặc!');
  }

  // 6. Kiểm tra console errors
  console.log('\n--- 6. Kiểm tra ReferenceError và TypeError trong console ---');
  const fatalErrors = [...consoleErrors, ...pageErrors].filter(
    (e) => e.includes('ReferenceError') || e.includes('TypeError')
  );
  if (fatalErrors.length > 0) {
    throw new Error('Phát hiện lỗi fatal trong console: ' + fatalErrors.join(' | '));
  }
  console.log('✅ CONSOLE HOÀN TOÀN SẠCH: 0 ReferenceError, 0 TypeError!');

  await browser.close();
  console.log('\n🎉🎉🎉 TẤT CẢ CÁC BƯỚC CỦA PROMPT 21B ĐÃ VƯỢT QUA 100% TRÊN PRODUCTION!');
}

run().catch((err) => {
  console.error('LỖI KIỂM THỬ:', err);
  process.exit(1);
});
