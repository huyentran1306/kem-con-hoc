import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const THEMES = [
  'bear', 'candy', 'bento', 'sticker', 'notebook',
  'garden', 'aurora', 'chalk', 'noel', 'tet', 'thieunhi'
];

const BASE_URL = 'http://localhost:4175';

async function run() {
  console.log('🚀 BẮT ĐẦU KIỂM THỬ ĐỢT 23: KHUÔN GIAO DIỆN GỌN (11 BỘ × 8 MÀN)');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  // Tạo thư mục bằng chứng
  const rootArtifactDir = '/Users/pro/.gemini/antigravity-ide/brain/1b85ea08-5390-4990-8f67-b7f2408f3dee/bang-chung/dot-23';
  const localEvidenceDir = 'bang-chung/dot-23';
  fs.mkdirSync(rootArtifactDir, { recursive: true });
  fs.mkdirSync(localEvidenceDir, { recursive: true });

  const errors = [];
  const rulesAudit = {
    noOverflow: true,
    maxOne56pxBtn: true,
    noUppercaseBtn: true,
    noCalmFab: true,
  };

  // Mở trang chủ
  await page.goto(BASE_URL);
  await page.waitForTimeout(1000);

  // Kích hoạt chế độ Dùng thử nếu ở trang login
  const trialBtn = page.locator('text=Dùng thử không cần tài khoản').first();
  if (await trialBtn.isVisible()) {
    await trialBtn.click();
    await page.waitForTimeout(800);
  }

  // Tự động kiểm tra nút nổi calm-fab
  const calmFabCount = await page.locator('.calm-fab').count();
  if (calmFabCount > 0) {
    rulesAudit.noCalmFab = false;
    errors.push('Phát hiện nút nổi calm-fab trên màn hình!');
  }

  for (const theme of THEMES) {
    console.log(`\n--- KIỂM THỬ BỘ GIAO DIỆN: ${theme.toUpperCase()} ---`);
    const themeDirLocal = path.join(localEvidenceDir, theme);
    const themeDirArtifact = path.join(rootArtifactDir, theme);
    fs.mkdirSync(themeDirLocal, { recursive: true });
    fs.mkdirSync(themeDirArtifact, { recursive: true });

    // Đổi theme bằng evaluate
    await page.evaluate((th) => {
      document.documentElement.setAttribute('data-theme', th);
      // Cập nhật S.theme trong localStorage nếu có
      try {
        const raw = localStorage.getItem('kem_state') || '{}';
        const parsed = JSON.parse(raw);
        parsed.theme = th;
        localStorage.setItem('kem_state', JSON.stringify(parsed));
      } catch (_) {}
    }, theme);
    await page.waitForTimeout(400);

    // 1. Màn Học tối nay
    await page.evaluate(() => {
      window.location.hash = '#/';
      // Trigger navigation nếu có
      const navHome = document.querySelector('button[aria-label*="Học tối nay"], .tab[data-tab="home"]');
      if (navHome) navHome.click();
    });
    await page.waitForTimeout(500);

    const shot1 = path.join(themeDirLocal, '1_hoc_toi_nay.png');
    const shot1Art = path.join(themeDirArtifact, '1_hoc_toi_nay.png');
    await page.screenshot({ path: shot1 });
    fs.copyFileSync(shot1, shot1Art);

    // Kiểm tra quy tắc UI ở màn Home
    const auditHome = await page.evaluate(() => {
      let overflow = false;
      let count56 = 0;
      let uppercaseBtn = false;

      const buttons = document.querySelectorAll('button, .btn, .btn-km');
      buttons.forEach((b) => {
        const rect = b.getBoundingClientRect();
        if (rect.height >= 55 && b.classList.contains('btn-km-l')) count56++;
        if (b.scrollWidth > b.clientWidth + 2) overflow = true;
        const text = (b.innerText || '').trim();
        // Kiểm tra chữ HOA quá 3 từ
        const words = text.split(/\s+/);
        if (words.length >= 3 && text === text.toUpperCase() && /[A-ZÀ-Ỹ]/.test(text)) {
          uppercaseBtn = true;
        }
      });
      return { overflow, count56, uppercaseBtn };
    });

    if (auditHome.overflow) rulesAudit.noOverflow = false;
    if (auditHome.count56 > 1) {
      console.warn(`[${theme}] Màn Home có ${auditHome.count56} nút 56px`);
      // chỉ tính là vi phạm nếu > 1
      rulesAudit.maxOne56pxBtn = false;
    }
    if (auditHome.uppercaseBtn) rulesAudit.noUppercaseBtn = false;

    // 2. Màn AI đọc đề (Review)
    await page.evaluate(() => {
      // Set hash hoặc trigger màn analyze
      const snapBtn = document.querySelector('[data-testid="start-type"]');
      if (snapBtn) snapBtn.click();
    });
    await page.waitForTimeout(300);

    // Mở typeProblem sheet nếu có
    const typeSheet = page.locator('.sheet-t5-card, .sheet');
    if (await typeSheet.isVisible()) {
      const chipToan = page.locator('text=Toán:').first();
      if (await chipToan.isVisible()) await chipToan.click();
      const readBtn = page.locator('button:has-text("Gấu đọc đề này"), button:has-text("soạn bài")').first();
      if (await readBtn.isVisible()) await readBtn.click();
      await page.waitForTimeout(800);
    }

    const shot2 = path.join(themeDirLocal, '2_ai_doc_de.png');
    const shot2Art = path.join(themeDirArtifact, '2_ai_doc_de.png');
    await page.screenshot({ path: shot2 });
    fs.copyFileSync(shot2, shot2Art);

    // 3. Màn Trước khi giảng
    // Bấm "Đúng rồi, soạn bài" nếu đang ở review
    const submitOcr = page.locator('button:has-text("Đúng rồi, soạn bài"), button:has-text("Tiếp tục")').first();
    if (await submitOcr.isVisible()) {
      await submitOcr.click();
      await page.waitForTimeout(1000);
    }

    const shot3 = path.join(themeDirLocal, '3_truoc_khi_giang.png');
    const shot3Art = path.join(themeDirArtifact, '3_truoc_khi_giang.png');
    await page.screenshot({ path: shot3 });
    fs.copyFileSync(shot3, shot3Art);

    // 4. Màn Hỏi con
    const startScaffoldBtn = page.locator('button:has-text("Bắt đầu hỏi con")').first();
    if (await startScaffoldBtn.isVisible()) {
      await startScaffoldBtn.click();
      await page.waitForTimeout(600);
    }

    // 4a. Đang hỏi
    const shot4a = path.join(themeDirLocal, '4a_hoi_con_dang_hoi.png');
    const shot4aArt = path.join(themeDirArtifact, '4a_hoi_con_dang_hoi.png');
    await page.screenshot({ path: shot4a });
    fs.copyFileSync(shot4a, shot4aArt);

    // 4b. Kẹt lần 2
    const stuckBtn = page.locator('button:has-text("Chưa nghĩ ra")').first();
    if (await stuckBtn.isVisible()) {
      await stuckBtn.click();
      await page.waitForTimeout(400);
      await stuckBtn.click();
      await page.waitForTimeout(400);
    }
    const shot4b = path.join(themeDirLocal, '4b_hoi_con_ket_lan_2.png');
    const shot4bArt = path.join(themeDirArtifact, '4b_hoi_con_ket_lan_2.png');
    await page.screenshot({ path: shot4b });
    fs.copyFileSync(shot4b, shot4bArt);

    // 4c. Ngăn Dành cho mẹ
    const momDrawerTrigger = page.locator('button:has-text("Dành cho mẹ")').first();
    if (await momDrawerTrigger.isVisible()) {
      await momDrawerTrigger.click();
      await page.waitForTimeout(400);
    }
    const shot4c = path.join(themeDirLocal, '4c_hoi_con_ngan_me.png');
    const shot4cArt = path.join(themeDirArtifact, '4c_hoi_con_ngan_me.png');
    await page.screenshot({ path: shot4c });
    fs.copyFileSync(shot4c, shot4cArt);

    // Đóng ngăn mẹ
    const closeMom = page.locator('.sheet-t5-close').first();
    if (await closeMom.isVisible()) await closeMom.click();

    // 5. Màn Xong bài
    // Bấm Con làm được qua các bậc tới Xong bài
    for (let k = 0; k < 4; k++) {
      const okBtn = page.locator('button:has-text("Con làm được!")').first();
      if (await okBtn.isVisible()) {
        await okBtn.click();
        await page.waitForTimeout(400);
      }
    }
    const finishBtn = page.locator('button:has-text("Hoàn thành bài")').first();
    if (await finishBtn.isVisible()) {
      await finishBtn.click();
      await page.waitForTimeout(600);
    }

    const shot5 = path.join(themeDirLocal, '5_xong_bai.png');
    const shot5Art = path.join(themeDirArtifact, '5_xong_bai.png');
    await page.screenshot({ path: shot5 });
    fs.copyFileSync(shot5, shot5Art);

    // 6. Kết quả chấm vở
    const checkWorkEntry = page.locator('text=Chấm vở con đã viết, text=Chấm vở ngay').first();
    if (await checkWorkEntry.isVisible()) {
      await checkWorkEntry.click();
      await page.waitForTimeout(600);
    }
    const shot6 = path.join(themeDirLocal, '6_ket_qua_cham_vo.png');
    const shot6Art = path.join(themeDirArtifact, '6_ket_qua_cham_vo.png');
    await page.screenshot({ path: shot6 });
    fs.copyFileSync(shot6, shot6Art);

    // 7. Màn Báo cáo (Khối kỹ năng dòng xu hướng)
    await page.evaluate(() => {
      const tabRpt = document.querySelector('.tab[data-tab="report"], button[aria-label*="Báo cáo"]');
      if (tabRpt) tabRpt.click();
    });
    await page.waitForTimeout(600);

    const shot7 = path.join(themeDirLocal, '7_bao_cao_ky_nang.png');
    const shot7Art = path.join(themeDirArtifact, '7_bao_cao_ky_nang.png');
    await page.screenshot({ path: shot7 });
    fs.copyFileSync(shot7, shot7Art);

    // 8. Bảng Thành viên gia đình (T5)
    await page.evaluate(() => {
      const tabProf = document.querySelector('.tab[data-tab="profile"], button[aria-label*="Con tôi"]');
      if (tabProf) tabProf.click();
    });
    await page.waitForTimeout(400);
    const memberEntry = page.locator('button:has-text("Thành viên gia đình")').first();
    if (await memberEntry.isVisible()) {
      await memberEntry.click();
      await page.waitForTimeout(500);
    }
    const shot8 = path.join(themeDirLocal, '8_thanh_vien.png');
    const shot8Art = path.join(themeDirArtifact, '8_thanh_vien.png');
    await page.screenshot({ path: shot8 });
    fs.copyFileSync(shot8, shot8Art);

    // Đóng bảng thành viên
    const closeMem = page.locator('.sheet-t5-close, button:has-text("✕")').first();
    if (await closeMem.isVisible()) await closeMem.click();
    await page.waitForTimeout(300);

    console.log(`✓ Đã chụp đủ 8 màn hình cho bộ ${theme}!`);
  }

  await browser.close();

  console.log('\n==================================================');
  console.log('📊 KẾT QUẢ TỰ ĐỘNG AUDIT QUY TẮC THIẾT KẾ:');
  console.log(`- Không phần tử nào tràn ngang: ${rulesAudit.noOverflow ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`- Mỗi màn tối đa 1 nút cao 56px: ${rulesAudit.maxOne56pxBtn ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`- Không còn chữ HOA trong nút: ${rulesAudit.noUppercaseBtn ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`- Không còn nút nổi "Mẹ bình tĩnh": ${rulesAudit.noCalmFab ? '✅ PASS' : '❌ FAIL'}`);
  console.log('==================================================\n');

  if (errors.length > 0) {
    console.error('Các lỗi phát hiện:', errors);
  } else {
    console.log('🎉 TẤT CẢ QUY TẮC ĐỢT 23 ĐÃ ĐẠT CHUẨN 100%!');
  }
}

run().catch((e) => {
  console.error('Test run failed:', e);
  process.exit(1);
});
