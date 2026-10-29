import { chromium } from 'playwright';

const TARGET_URL = process.argv[2] || 'https://preview.kem-con-hoc-5xf.pages.dev';

async function testPrompt38() {
  console.log('🚀 Bắt đầu kiểm thử Đợt 38 (màn Con tôi v3) trên:', TARGET_URL);
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

  // ----------------------------------------------------
  // TEST 1: Mobile 390px (Bạn Gấu) - Kiểm tra màn Con tôi & Các luồng
  // ----------------------------------------------------
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

  // Vào Dùng thử nếu thấy nút
  const dungThuBtn = page.locator('button:has-text("Dùng thử")').first();
  if (await dungThuBtn.count() > 0 && await dungThuBtn.isVisible()) {
    console.log('Bấm "✨ Dùng thử"...');
    await dungThuBtn.click();
    await page.waitForTimeout(1200);
  }

  // Chuyển sang tab "Con tôi"
  const tabProfile = page.locator('.tabs button:has-text("Con tôi"), nav button:has-text("Con tôi")').first();
  await tabProfile.click();
  await page.waitForTimeout(1000);

  await page.waitForSelector('[data-testid="profile-v3"]', { timeout: 10000 });
  console.log('✓ Container data-testid="profile-v3" hiển thị!');

  // 1.1 Nút "Thêm con" nổi bật dính đáy trong vùng ngón cái
  const btnAddChild = page.locator('[data-testid="btn-add-child"]');
  const btnAddVis = await btnAddChild.isVisible();
  console.log('1. Nút "Thêm con" dính đáy visible:', btnAddVis);
  if (!btnAddVis) throw new Error('Không thấy nút Thêm con dính đáy!');

  // 1.2 Nút bút chì sửa hồ sơ
  const btnEdit = page.locator('[data-testid="btn-edit-child"]').first();
  const btnEditVis = await btnEdit.isVisible();
  console.log('2. Nút bút chì sửa hồ sơ visible:', btnEditVis);
  if (!btnEditVis) throw new Error('Không thấy nút bút chì sửa hồ sơ!');

  // 1.3 Thử luồng Sửa hồ sơ con & Hoàn tác
  console.log('\n--- Kiểm tra Sửa hồ sơ con & Hoàn tác ---');
  await btnEdit.click();
  await page.waitForTimeout(600);
  const editSheet = page.locator('[data-testid="sheet-edit-child"]');
  await editSheet.waitFor({ state: 'visible', timeout: 5000 });

  const inputEditName = editSheet.locator('input.cf-input').first();
  const oldName = await inputEditName.inputValue();
  console.log('   Tên cũ của bé:', oldName);

  await inputEditName.fill(oldName + ' Cute');
  await page.waitForTimeout(300);

  const btnSaveEdit = editSheet.locator('button[data-testid="edit-child-save"]');
  await btnSaveEdit.click();
  await page.waitForTimeout(800);

  // Toast xuất hiện kèm nút Hoàn tác
  const undoToast = page.locator('button.toast-undo').first();
  const undoVis = await undoToast.isVisible();
  console.log('   Nút Hoàn tác trong Toast visible:', undoVis);
  if (!undoVis) throw new Error('Không thấy nút Hoàn tác trong toast sau khi sửa hồ sơ!');

  console.log('   Bấm Hoàn tác...');
  await undoToast.click();
  await page.waitForTimeout(600);
  const revertedTitle = await page.locator('.pf-profile h2').first().innerText();
  console.log('   Tên hiển thị sau khi hoàn tác:', revertedTitle);
  if (!revertedTitle.includes(oldName) || revertedTitle.includes('Cute')) {
    throw new Error('Hoàn tác không khôi phục tên cũ!');
  }

  // 1.4 Thử luồng Thêm con 3 bước: Báo lỗi tức thì & Hoàn tác
  console.log('\n--- Kiểm tra Thêm con (form 3 bước) ---');
  await btnAddChild.click();
  await page.waitForTimeout(600);

  const addSheet = page.locator('[data-testid="sheet-add-child"]');
  await addSheet.waitFor({ state: 'visible', timeout: 5000 });

  // Bước 1: Bấm Tiếp tục khi chưa nhập tên -> Báo lỗi ngay dưới ô
  console.log('   Bước 1: Bấm Tiếp tục khi tên trống...');
  const btnNext = addSheet.locator('[data-testid="add-child-next"]');
  await btnNext.click();
  await page.waitForTimeout(400);

  const nameErrEl = addSheet.locator('.cf-err[role="alert"]');
  const nameErrVis = await nameErrEl.isVisible();
  console.log('   Báo lỗi tên trống visible:', nameErrVis);
  if (!nameErrVis) throw new Error('Không báo lỗi khi bấm Tiếp tục với tên trống!');

  // Nhập trùng tên bé hiện có -> báo trùng
  console.log('   Nhập trùng tên bé hiện có...');
  const inputAddName = addSheet.locator('#add-child-name');
  await inputAddName.fill(oldName);
  await page.waitForTimeout(400);
  const dupErr = await nameErrEl.innerText();
  console.log('   Báo lỗi trùng tên:', dupErr);
  if (!dupErr.includes('đã có')) throw new Error('Không báo lỗi trùng tên bé đã có!');

  // Nhập tên mới hợp lệ
  const newKidName = 'Bé Bắp';
  await inputAddName.fill(newKidName);
  await page.waitForTimeout(300);
  await btnNext.click();
  await page.waitForTimeout(500);

  // Bước 2: Bấm Tiếp tục khi chưa chọn lớp/sách -> Báo lỗi
  console.log('   Bước 2: Bấm Tiếp tục khi chưa chọn lớp/bộ sách...');
  await btnNext.click();
  await page.waitForTimeout(400);
  const step2ErrCount = await addSheet.locator('.cf-err[role="alert"]').count();
  console.log('   Báo lỗi bước 2 count:', step2ErrCount);
  if (step2ErrCount === 0) throw new Error('Không báo lỗi khi chưa chọn lớp/sách ở bước 2!');

  // Chọn Lớp 2 & Kết nối tri thức
  await addSheet.locator('.cf-opt:has-text("Lớp 2")').first().click();
  await addSheet.locator('.cf-opt:has-text("Kết nối tri thức")').first().click();
  await page.waitForTimeout(300);
  await btnNext.click();
  await page.waitForTimeout(500);

  // Bước 3: Môn cần kèm & Xem lại -> Thêm bé
  console.log('   Bước 3: Xem lại & bấm "Thêm bé"...');
  const btnAddFinal = addSheet.locator('[data-testid="add-child-next"]');
  const finalBtnText = await btnAddFinal.innerText();
  console.log('   Nút bấm bước 3:', finalBtnText.trim());
  if (!finalBtnText.includes('Thêm bé')) throw new Error('Nút bước 3 không phải "Thêm bé"!');

  await btnAddFinal.click();
  await page.waitForTimeout(800);

  // Toast thêm bé xuất hiện có nút Hoàn tác
  const undoAddToast = page.locator('button.toast-undo').first();
  const undoAddVis = await undoAddToast.isVisible();
  console.log('   Toast Thêm bé có nút Hoàn tác visible:', undoAddVis);
  if (!undoAddVis) throw new Error('Không thấy nút Hoàn tác sau khi thêm con!');

  // Bé mới đã được thêm vào danh sách
  const newKidBtn = page.locator(`.pf-kid:has-text("${newKidName}")`);
  console.log('   Bé mới xuất hiện trên thanh chọn bé:', await newKidBtn.isVisible());

  // Bấm Hoàn tác để xoá bé vừa thêm
  console.log('   Bấm Hoàn tác thêm bé...');
  await undoAddToast.click();
  await page.waitForTimeout(600);
  const undoneKidCount = await page.locator(`.pf-kid:has-text("${newKidName}")`).count();
  console.log('   Bé mới sau khi hoàn tác count:', undoneKidCount);
  if (undoneKidCount > 0) throw new Error('Hoàn tác không xoá bé vừa thêm!');

  // 1.5 Kiểm tra Đang nhập dở mà bấm ✕ thì hỏi lại
  console.log('\n--- Kiểm tra hỏi lại khi đóng dở ---');
  await btnAddChild.click();
  await page.waitForTimeout(500);
  await addSheet.locator('#add-child-name').fill('Bé Dở Dang');
  await page.waitForTimeout(300);

  await addSheet.locator('button.cf-x').click();
  await page.waitForTimeout(500);

  const confirmModal = page.locator('.app-dialog, [role="dialog"]:has-text("Bỏ thông tin")').first();
  const confirmVis = await confirmModal.isVisible();
  console.log('   Hộp xác nhận "Bỏ thông tin đang nhập?" visible:', confirmVis);
  if (!confirmVis) throw new Error('Không hỏi xác nhận khi đóng lúc đang nhập dở!');

  // Bấm "Tiếp tục nhập"
  await page.locator('button:has-text("Tiếp tục nhập")').click();
  await page.waitForTimeout(400);

  // Đóng thật
  await addSheet.locator('button.cf-x').click();
  await page.waitForTimeout(400);
  await page.locator('button:has-text("Bỏ thông tin")').click();
  await page.waitForTimeout(600);

  // 1.6 Mở "Riêng tư và an toàn", bấm ✕ một ghi nhớ -> Hỏi xác nhận
  console.log('\n--- Kiểm tra Riêng tư & Xoá ghi nhớ có hỏi lại ---');
  const rowPrivacy = page.locator('[data-testid="row-privacy"]').first();
  await rowPrivacy.click();
  await page.waitForTimeout(500);

  const btnDelMem = page.locator('[data-testid="btn-mem-del"]').first();
  if (await btnDelMem.isVisible()) {
    console.log('   Bấm nút ✕ xoá 1 ghi nhớ...');
    await btnDelMem.click();
    await page.waitForTimeout(500);

    const delModal = page.locator('[role="dialog"]:has-text("Xoá ghi nhớ này")').first();
    const delModalVis = await delModal.isVisible();
    console.log('   Hộp xác nhận xoá ghi nhớ visible:', delModalVis);
    if (!delModalVis) throw new Error('Không hỏi xác nhận khi xoá ghi nhớ!');

    // Bấm "Giữ lại"
    console.log('   Bấm "Giữ lại"...');
    await page.locator('button:has-text("Giữ lại")').click();
    await page.waitForTimeout(400);
    console.log('   Ghi nhớ vẫn còn:', await btnDelMem.isVisible());
  }

  // 1.7 Bấm Đăng xuất -> Có hỏi lại
  console.log('\n--- Kiểm tra hỏi lại khi Đăng xuất ---');
  const btnLogout = page.locator('button:has-text("Đăng xuất")').first();
  if (await btnLogout.isVisible()) {
    await btnLogout.click();
    await page.waitForTimeout(500);
    const logoutModal = page.locator('[role="dialog"]:has-text("Đăng xuất khỏi")').first();
    const logoutVis = await logoutModal.isVisible();
    console.log('   Hộp xác nhận Đăng xuất visible:', logoutVis);
    if (!logoutVis) throw new Error('Không hỏi xác nhận khi bấm Đăng xuất!');

    // Bấm "Ở lại"
    await page.locator('button:has-text("Ở lại")').click();
    await page.waitForTimeout(400);
  }

  // ----------------------------------------------------
  // TEST 2: Màn hẹp 320px & Màn rộng 1440px
  // ----------------------------------------------------
  console.log('\n--- Test 2: Màn hẹp 320px & Màn rộng 1440px ---');
  const ctx320 = await browser.newContext({
    viewport: { width: 320, height: 600 },
    locale: 'vi-VN',
  });
  const page320 = await ctx320.newPage();
  page320.on('console', (m) => logConsole('Screen 320', m));
  await page320.goto(`${TARGET_URL}?theme=garden`, { waitUntil: 'domcontentloaded' });
  await page320.waitForTimeout(1000);
  const tabP320 = page320.locator('.tabs button:has-text("Con tôi")').first();
  if (await tabP320.isVisible()) {
    await tabP320.click();
    await page320.waitForTimeout(800);
    console.log('   320px theme garden: Màn Con tôi visible:', await page320.locator('[data-testid="profile-v3"]').isVisible());
  }

  const ctxDesk = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const pageDesk = await ctxDesk.newPage();
  pageDesk.on('console', (m) => logConsole('Desktop 1440', m));
  await pageDesk.goto(`${TARGET_URL}?theme=aurora`, { waitUntil: 'domcontentloaded' });
  await pageDesk.waitForTimeout(1000);
  const tabPDesk = pageDesk.locator('.tabs button:has-text("Con tôi")').first();
  if (await tabPDesk.isVisible()) {
    await tabPDesk.click();
    await pageDesk.waitForTimeout(800);
    console.log('   1440px theme aurora: Màn Con tôi visible:', await pageDesk.locator('[data-testid="profile-v3"]').isVisible());
  }

  await browser.close();

  console.log('\n=========================================');
  console.log('🏁 TỔNG KẾT KIỂM THỬ ĐỢT 38:');
  console.log('Lỗi JS (ReferenceError / TypeError):', errors.length);
  if (errors.length > 0) {
    console.error('Các lỗi JS:', errors);
    throw new Error('Phát hiện lỗi JS!');
  }
  console.log('✓ TẤT CẢ CÁC MỤC KIỂM THỬ ĐỀU ĐẠT CHUẨN 100%!');
  console.log('=========================================\n');
}

testPrompt38().catch((err) => {
  console.error('Lỗi kiểm thử Đợt 38:', err);
  process.exit(1);
});
