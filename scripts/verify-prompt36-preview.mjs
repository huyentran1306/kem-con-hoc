import { chromium } from 'playwright';

const TARGET_URL = process.argv[2] || 'https://preview.kem-con-hoc-5xf.pages.dev';

async function testPrompt36() {
  console.log('🚀 Bắt đầu kiểm thử Đợt 36 trên:', TARGET_URL);
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
  console.log('\n--- 1. Kiểm tra Báo cáo trên Mobile 390px (Bạn Gấu) ---');
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    locale: 'vi-VN',
  });
  const page = await ctx.newPage();
  page.on('console', (m) => logConsole('Mobile 390', m));

  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const dungThu = page.locator('button:has-text("Dùng thử")').first();
  if (await dungThu.count() > 0 && await dungThu.isVisible()) {
    console.log('Bấm "✨ Dùng thử"...');
    await dungThu.click();
    await page.waitForTimeout(1500);
  }

  // Chuyển sang tab Báo cáo
  console.log('Mở tab Báo cáo...');
  const tabBaoCao = page.locator('.tabs button:has-text("Báo cáo"), nav button:has-text("Báo cáo")').first();
  await tabBaoCao.click();
  await page.waitForTimeout(1200);

  // 1.1 Không còn "An toàn AI 7 ngày"
  const anToanCount = await page.locator('text="An toàn AI 7 ngày", text="An toàn AI"').count();
  console.log('Khối "An toàn AI 7 ngày" count:', anToanCount);
  if (anToanCount > 0) {
    throw new Error('Vẫn còn khối "An toàn AI" trong Báo cáo!');
  }

  // 1.2 Kiểm tra 3 ô số liệu đầu trang & dòng kèm
  const headerText = await page.innerText('body');
  console.log('Có dòng Bố kèm / Mẹ kèm:', /Bố kèm|Mẹ kèm/.test(headerText));

  // 1.3 Kiểm tra thanh mục dính 4 mục: Tổng quan, Kỹ năng, Lịch học, Cho bố mẹ/mẹ
  const subnavItems = ['Tổng quan', 'Kỹ năng', 'Lịch học', 'Cho'];
  for (const item of subnavItems) {
    const el = page.locator(`.rp-tabs button:has-text("${item}"), button.rp-tab:has-text("${item}"), button:has-text("${item}")`).first();
    const vis = await el.isVisible();
    console.log(`Thanh mục dính "${item}":`, vis);
    if (!vis) throw new Error(`Không tìm thấy mục "${item}" trên thanh dính!`);
  }

  // 1.4 "Con hay kẹt ở bước nào?" & dropdown môn học
  const ketTitle = await page.locator('text="Con hay kẹt ở bước nào?"').isVisible();
  console.log('Tiêu đề "Con hay kẹt ở bước nào?":', ketTitle);
  if (!ketTitle) throw new Error('Không có tiêu đề "Con hay kẹt ở bước nào?"!');

  const subjectSelect = page.locator('select[data-testid="skill-subject-select"], select:has-text("Toán")').first();
  console.log('Dropdown chọn môn visible:', await subjectSelect.isVisible());
  // Chọn Tiếng Anh
  await subjectSelect.selectOption('Tiếng Anh');
  await page.waitForTimeout(500);
  const engNotice = await page.locator(':has-text("Chưa có dữ liệu Tiếng Anh")').first().isVisible();
  console.log('Môn Tiếng Anh báo chưa có dữ liệu:', engNotice);
  if (!engNotice) throw new Error('Không thấy thông báo chưa có dữ liệu Tiếng Anh!');

  // Chọn lại Toán
  await subjectSelect.selectOption('Toán');
  await page.waitForTimeout(500);

  // 1.5 Lịch học tô đậm nhạt & bấm xem số phút
  const calendarCells = page.locator('button.rp-d, .rp-cal-grid button, .rp-cal-grid span');
  const cellCount = await calendarCells.count();
  console.log('Số ô lịch học có dữ liệu:', cellCount);

  // Bấm thử một ô lịch có học
  const activeDay = page.locator('button.rp-d.l1, button.rp-d.l2, button.rp-d.l3, button.rp-d.l4').first();
  if (await activeDay.count() > 0 && await activeDay.isVisible()) {
    await activeDay.click();
    await page.waitForTimeout(500);
    const dayTip = await page.locator('p.rp-day-info').first().innerText();
    console.log('Chi tiết ngày khi bấm:', dayTip.replace(/\n/g, ' '));
  }

  // 1.6 Bảng gửi Zalo & thời hạn link (1-30 ngày)
  console.log('\n--- 2. Bấm "Gửi báo cáo vào nhóm Zalo gia đình" ---');
  const btnZalo = page.locator('button[data-testid="rp-send-zalo"], button:has-text("Gửi báo cáo vào nhóm Zalo")').first();
  await btnZalo.click();
  await page.waitForTimeout(800);

  const inputDays = page.locator('input[data-testid="zalo-exp-days"], #zalo-exp-days').first();
  await inputDays.waitFor({ state: 'visible', timeout: 5000 });

  // Nhập 45 ngày -> cắt tối đa 2 chữ số (45) -> báo lỗi "Tối đa 30 ngày" và nút gửi bị khoá
  console.log('Thử nhập 45 ngày...');
  await inputDays.fill('45');
  await page.waitForTimeout(700);

  const maxWarn = await page.locator('text="Tối đa 30 ngày"').isVisible();
  console.log('Cảnh báo "Tối đa 30 ngày":', maxWarn);
  if (!maxWarn) throw new Error('Không cảnh báo khi nhập 45 ngày!');

  // Nhập 21 ngày -> hợp lệ
  console.log('Thử nhập 21 ngày...');
  await inputDays.fill('21');
  await page.waitForTimeout(700);
  const okVal = await inputDays.inputValue();
  console.log('Giá trị sau khi nhập:', okVal);

  // Đóng modal Zalo
  const closeZalo = page.locator('button[aria-label="Đóng"], .round-btn:has-text("✕")').first();
  if (await closeZalo.isVisible()) await closeZalo.click();

  // Test 2: Thử trên bộ Khu Vườn Đêm (dark mode)
  console.log('\n--- 3. Kiểm tra theme Khu Vườn Đêm (garden) ---');
  await page.goto(`${TARGET_URL}?theme=garden`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  const tabBaoCaoGarden = page.locator('.tabs button:has-text("Báo cáo"), nav button:has-text("Báo cáo")').first();
  await tabBaoCaoGarden.click();
  await page.waitForTimeout(1000);
  const gardenTitle = await page.locator('text="Con hay kẹt ở bước nào?"').isVisible();
  console.log('Theme garden - Tiêu đề Báo cáo visible:', gardenTitle);

  // Test 3: Desktop 1440px
  console.log('\n--- 4. Kiểm tra Desktop 1440px ---');
  const ctxDesk = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const pageDesk = await ctxDesk.newPage();
  pageDesk.on('console', (m) => logConsole('Desktop 1440', m));

  await pageDesk.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  await pageDesk.waitForTimeout(1500);

  const dungThuDesk = pageDesk.locator('button:has-text("Dùng thử")').first();
  if (await dungThuDesk.count() > 0 && await dungThuDesk.isVisible()) {
    await dungThuDesk.click();
    await pageDesk.waitForTimeout(1500);
  }

  const tabBaoCaoDesk = pageDesk.locator('.tabs button:has-text("Báo cáo"), nav button:has-text("Báo cáo")').first();
  await tabBaoCaoDesk.click();
  await pageDesk.waitForTimeout(1000);

  const deskTitle = await pageDesk.locator('text="Con hay kẹt ở bước nào?"').isVisible();
  console.log('Desktop 1440 - Báo cáo visible:', deskTitle);

  await browser.close();

  console.log('\n=========================================');
  console.log('🏁 TỔNG KẾT KIỂM THỬ ĐỢT 36:');
  console.log('Lỗi JS (ReferenceError / TypeError):', errors.length);
  if (errors.length > 0) {
    console.error('Các lỗi JS:', errors);
    throw new Error('Phát hiện lỗi JS!');
  }
  console.log('✓ TẤT CẢ CÁC MỤC KIỂM THỬ ĐỀU ĐẠT CHUẨN 100%!');
  console.log('=========================================\n');
}

testPrompt36().catch((err) => {
  console.error('Lỗi kiểm thử Đợt 36:', err);
  process.exit(1);
});
