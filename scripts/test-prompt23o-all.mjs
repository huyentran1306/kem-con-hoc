import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const THEMES = [
  'bear', 'candy', 'bento', 'sticker', 'notebook',
  'garden', 'aurora', 'chalk', 'noel', 'tet', 'thieunhi'
];

const ALLOWED_SKIPS = [
  'Nút chọn Bé Na / Bé Tít',
  'Bé Na', 'Bé Tít',
  'Tự làm được / Cần gợi ý / Cần hướng dẫn',
  'Tự làm được', 'Cần gợi ý', 'Cần hướng dẫn',
  'Đấu trí', 'Đấu trí hai đầu bàn',
  'Xem đề',
  'thông báo của cô rút gọn',
  'Hoạ tiết ✦ ✦ ✦ của Kẹo Bông'
];

function isAllowedSkip(item) {
  const txt = (item.txt || item.a || item.b || '') + '';
  return ALLOWED_SKIPS.some(s => txt.includes(s));
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream']
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    permissions: ['camera']
  });

  await context.addInitScript(() => {
    try {
      localStorage.setItem('kem-con-hoc:session', JSON.stringify({ id: 'fam_na', name: 'Gia đình bé Na', role: 'parent', isTrial: false }));
      localStorage.setItem('kem-con-hoc:onboarded', 'true');
    } catch (e) {}
  });

  const page = await context.newPage();

  const evidenceDir = path.join(process.cwd(), 'bang-chung/prompt23o');
  fs.mkdirSync(evidenceDir, { recursive: true });

  await page.goto('http://127.0.0.1:4173/');
  await page.waitForTimeout(800);

  await page.evaluate(() => {
    if (window.__kchPatch) window.__kchPatch({ onboarded: true });
  });
  await page.waitForTimeout(400);

  const kiemPath = path.join(process.cwd(), 'scripts/kiem-bo-cuc.js');

  const themeResults = {};
  const allIssues = [];

  for (const theme of THEMES) {
    console.log(`\n========================================`);
    console.log(`Kiểm tra bộ: ${theme.toUpperCase()}`);
    console.log(`========================================`);

    // Switch theme
    await page.evaluate((t) => {
      if (window.__kchPatch) window.__kchPatch({ theme: t, onboarded: true });
    }, theme);
    await page.waitForTimeout(400);

    let themeIssues = [];

    const checkCurrentScreen = async (screenName) => {
      await page.addScriptTag({ path: kiemPath });
      const raw = await page.evaluate(() => window.kiemBoCuc());
      const filtered = raw.filter(it => it.sev <= 3 && !isAllowedSkip(it));
      if (filtered.length > 0) {
        console.log(`  [!] ${screenName}: ${filtered.length} lỗi (sev <= 3)`);
        filtered.forEach(f => console.log(`      - ${f.t} (sev ${f.sev}): ${f.txt || f.a || ''} (${f.ratio || f.gap || ''})`));
      } else {
        console.log(`  [OK] ${screenName}: 0 lỗi`);
      }
      themeIssues.push(...filtered.map(f => ({ screen: screenName, ...f })));
    };

    // 1. Trang chủ
    await page.evaluate(() => window.__kchGo && window.__kchGo('home'));
    await page.waitForTimeout(300);
    await checkCurrentScreen('Trang chủ');

    // 2. Gõ đề (Analyze)
    await page.evaluate(() => window.__kchGo && window.__kchGo('analyze'));
    await page.waitForTimeout(300);
    await checkCurrentScreen('Gõ đề');

    // 3. Trước khi giảng (Explain)
    await page.evaluate(() => window.__kchGo && window.__kchGo('explain'));
    await page.waitForTimeout(300);
    await checkCurrentScreen('Trước khi giảng');

    // 4. Hỏi con (Scaffold)
    await page.evaluate(() => window.__kchGo && window.__kchGo('scaffold'));
    await page.waitForTimeout(300);
    await checkCurrentScreen('Hỏi con từng bước');

    // 5. Gợi ý khi con kẹt (bấm Chưa nghĩ ra)
    const stuckBtn = page.locator('button:has-text("Chưa nghĩ ra")').first();
    if (await stuckBtn.isVisible()) {
      await stuckBtn.click();
      await page.waitForTimeout(300);
      await checkCurrentScreen('Gợi ý khi con kẹt');
    }

    // 6. Dành cho mẹ (Mom Drawer)
    const momDrawerBtn = page.locator('text=🔒 Dành cho mẹ').first();
    if (await momDrawerBtn.isVisible()) {
      await momDrawerBtn.click();
      await page.waitForTimeout(300);
      await checkCurrentScreen('Ngăn Dành cho mẹ');
      // Đóng drawer
      const closeMom = page.locator('.sheet-t5-close').first();
      if (await closeMom.isVisible()) {
        await closeMom.click();
      } else {
        await page.evaluate(() => {
          const bd = document.querySelector('[data-testid="mom-drawer-backdrop"]');
          if (bd) bd.click();
        });
      }
      await page.waitForTimeout(300);
    }

    // 7. Xong bài (Done)
    await page.evaluate(() => window.__kchGo && window.__kchGo('done'));
    await page.waitForTimeout(300);
    await checkCurrentScreen('Xong bài');

    // 8. Báo cáo (Report)
    await page.evaluate(() => window.__kchGo && window.__kchGo('report'));
    await page.waitForTimeout(300);
    await checkCurrentScreen('Báo cáo (Tuần này)');

    // 9. Con tôi (Profile)
    await page.evaluate(() => window.__kchGo && window.__kchGo('profile'));
    await page.waitForTimeout(300);
    await checkCurrentScreen('Con tôi');

    const closeOpenSheet = async () => {
      await page.evaluate(() => {
        if (window.__kchCloseSheet) window.__kchCloseSheet();
        const btn = document.querySelector('.sheet button[aria-label="Đóng"]') ||
                    document.querySelector('button[aria-label="Đóng"]') ||
                    document.querySelector('.sheet-t5-close') ||
                    document.querySelector('.sheet .btn-km-circle');
        if (btn) btn.click();
      });
      await page.waitForTimeout(350);
    };

    // 9a. Mở sheet Lớp học của con
    const classBtn = page.locator('text=Lớp học của con').first();
    if (await classBtn.isVisible()) {
      await classBtn.click();
      await page.waitForTimeout(400);
      await checkCurrentScreen('Bảng Lớp học của con');
      await closeOpenSheet();
    }

    // 9b. Mở sheet Thành viên gia đình
    const memberBtn = page.locator('text=Thành viên gia đình').first();
    if (await memberBtn.isVisible()) {
      await memberBtn.click();
      await page.waitForTimeout(400);
      await checkCurrentScreen('Bảng Thành viên gia đình');
      await closeOpenSheet();
    }

    // 9c. Mở sheet Giao diện cả nhà
    const themeBtn = page.locator('text=Giao diện cả nhà').first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await page.waitForTimeout(400);
      await checkCurrentScreen('Bảng Giao diện cả nhà');
      await closeOpenSheet();
    }

    // 10. Trò chơi (Toy / GocChoiChung)
    await page.evaluate(() => window.__kchGo && window.__kchGo('toy'));
    await page.waitForTimeout(400);
    await checkCurrentScreen('Tab Trò chơi (Góc chơi chung & Chụp đồ vật)');

    // 11. Chấm vở (CheckWork)
    await page.evaluate(() => window.__kchGo && window.__kchGo('checkWork'));
    await page.waitForTimeout(300);
    await checkCurrentScreen('Chấm vở');

    // 12. Mẹ bình tĩnh (Calm)
    await page.evaluate(() => window.__kchGo && window.__kchGo('home'));
    await page.waitForTimeout(200);
    const calmBtn = page.locator('button[title*="bình tĩnh"], button[aria-label*="bình tĩnh"]').first();
    if (await calmBtn.isVisible()) {
      await calmBtn.click();
      await page.waitForTimeout(300);
      await checkCurrentScreen('Mẹ bình tĩnh');
      await closeOpenSheet();
    }

    themeResults[theme] = themeIssues.length;
    allIssues.push(...themeIssues);

    // Chụp 3 màn ở 3 bộ theo yêu cầu: Xuân Sum Vầy (tet), Sticker Studio (sticker), Bảng Phấn (chalk)
    if (['tet', 'sticker', 'chalk'].includes(theme)) {
      console.log(`📸 Chụp 3 ảnh bằng chứng cho bộ: ${theme}...`);
      
      // Ảnh 1: khu Chụp đồ vật
      await page.evaluate(() => window.__kchGo && window.__kchGo('toy'));
      await page.waitForTimeout(400);
      // scroll to camera section
      await page.evaluate(() => {
        const el = document.querySelector('.cam') || document.querySelector('[data-testid="snap-toy-static-invite"]');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      });
      await page.waitForTimeout(200);
      await page.screenshot({ path: path.join(evidenceDir, `${theme}_1_chup_do_vat.png`) });

      // Ảnh 2: Lớp học của con
      await page.evaluate(() => window.__kchGo && window.__kchGo('profile'));
      await page.waitForTimeout(300);
      const cBtn = page.locator('text=Lớp học của con').first();
      if (await cBtn.isVisible()) {
        await cBtn.click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(evidenceDir, `${theme}_2_lop_hoc.png`) });
        await closeOpenSheet();
      }

      // Ảnh 3: Báo cáo
      await page.evaluate(() => window.__kchGo && window.__kchGo('report'));
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(evidenceDir, `${theme}_3_bao_cao.png`) });
    }
  }

  console.log(`\n========================================`);
  console.log(`TỔNG HỢP KẾT QUẢ KIỂM BỐ CỤC 11 BỘ`);
  console.log(`========================================`);
  console.table(themeResults);
  console.log(`Tổng số lỗi (sev <= 3): ${allIssues.length}`);

  await browser.close();
  return { themeResults, allIssues };
}

run().catch(console.error);
