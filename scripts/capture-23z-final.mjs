import { chromium } from 'playwright'

async function run() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  await page.goto('http://127.0.0.1:8089/')
  await page.waitForTimeout(500)

  // 1. Chụp màn Đăng nhập
  await page.screenshot({ path: 'bang-chung/prompt23z/01_login_390.png' })
  console.log('✓ Đã chụp 01_login_390.png')

  // 2. Chuyển sang Tạo gia đình mới
  const regBtn = page.locator('button:has-text("Tạo gia đình mới")')
  await regBtn.click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: 'bang-chung/prompt23z/02_register_390.png' })
  console.log('✓ Đã chụp 02_register_390.png')

  // 3. Mở Tham gia gia đình (Có mã mời)
  const joinBtn = page.locator('button:has-text("Có mã mời")')
  await joinBtn.click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: 'bang-chung/prompt23z/03_join_invite_390.png' })
  console.log('✓ Đã chụp 03_join_invite_390.png')

  // Đo nút Kiểm tra
  const checkBtn = page.locator('button:has-text("Kiểm tra")').first()
  const checkBtnBox = await checkBtn.boundingBox()
  console.log(`  -> Bề rộng nút "Kiểm tra": ${Math.round(checkBtnBox?.width || 0)}px (Yêu cầu >= 100px, 1 dòng chữ)`)

  // Quay lại
  const backBtn = page.locator('button:has-text("Về màn hình chính")').first()
  await backBtn.click()
  await page.waitForTimeout(300)

  // 4. Vào App qua Dùng thử
  const trialBtn = page.locator('button:has-text("Dùng thử")').first()
  await trialBtn.click()
  await page.waitForTimeout(600)

  // Chuyển sang tab Con tôi
  const profileTab = page.locator('.bnav-btn:has-text("Con tôi"), button:has-text("Con tôi")').first()
  await profileTab.click()
  await page.waitForTimeout(500)

  // Mở Giao diện cả nhà
  const themeCard = page.locator('text=Giao diện cả nhà').first()
  await themeCard.click()
  await page.waitForTimeout(600)

  // Chọn bộ Khu Vườn Đêm
  const gardenCard = page.locator('.theme-grid-card:has-text("Khu Vườn Đêm"), .theme-grid-card').nth(3)
  if (await gardenCard.isVisible()) {
    await gardenCard.click()
    await page.waitForTimeout(400)
  }

  // Cuộn xuống cuối bảng
  await page.evaluate(() => {
    const pn = document.querySelector('.sheet .pn')
    if (pn) pn.scrollTop = pn.scrollHeight
  })
  await page.waitForTimeout(400)

  // Đo đạc bảng trượt và 2 nút
  const measurements = await page.evaluate(() => {
    const pn = document.querySelector('.sheet .pn')
    const actions = document.querySelector('.sheet-actions-bar')
    const btns = actions ? Array.from(actions.querySelectorAll('button')) : []
    const pnRect = pn.getBoundingClientRect()
    return {
      pnWidth: pn.clientWidth,
      pnScrollWidth: pn.scrollWidth,
      hasHScroll: pn.scrollWidth > pn.clientWidth,
      btn1Text: btns[0]?.innerText.trim(),
      btn1Width: btns[0]?.offsetWidth,
      btn2Text: btns[1]?.innerText.trim(),
      btn2Width: btns[1]?.offsetWidth,
      btn2Right: btns[1]?.getBoundingClientRect().right,
      pnRight: pnRect.right,
      isFullyInside: btns[1]?.getBoundingClientRect().right <= pnRect.right + 2,
    }
  })

  console.log('\n--- SỐ ĐO BẢNG ĐỔI GIAO DIỆN (390px) ---')
  console.log(`Khung bảng: clientWidth=${measurements.pnWidth}px, scrollWidth=${measurements.pnScrollWidth}px`)
  console.log(`Lỗi cuộn ngang: ${measurements.hasHScroll ? '❌ CÓ' : '✓ KHÔNG (0 LỖI)'}`)
  console.log(`Nút 1 ("${measurements.btn1Text}"): rộng ${measurements.btn1Width}px`)
  console.log(`Nút 2 ("${measurements.btn2Text}"): rộng ${measurements.btn2Width}px`)
  console.log(`Nút chính trọn vẹn trong màn hình: ${measurements.isFullyInside ? '✓ ĐÚNG' : '❌ BỊ LỆCH'}`)

  await page.screenshot({ path: 'bang-chung/prompt23z/04_theme_sheet_390.png' })
  console.log('✓ Đã chụp 04_theme_sheet_390.png')

  await browser.close()
}

run().catch(console.error)
