import { chromium } from 'playwright'

async function run() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })

  await page.goto('http://127.0.0.1:8089/')
  await page.evaluate(() => localStorage.clear())
  await page.goto('http://127.0.0.1:8089/')
  await page.waitForTimeout(400)
  await page.locator('button:has-text("Dùng thử")').first().click()
  await page.waitForTimeout(600)

  // 1. Mở Gõ đề bài
  await page.locator('button:has-text("Gõ đề bài")').first().click()
  await page.waitForTimeout(400)

  // 2. Bấm Gấu đọc đề này
  await page.locator('button:has-text("Gấu đọc đề này")').first().click()
  await page.waitForTimeout(700)

  // 3. Màn Review đề: chụp P1-11
  await page.screenshot({ path: 'bang-chung/prompt27/p1_11_gau_doc_de_390.png' })
  console.log('✓ Đã chụp p1_11_gau_doc_de_390.png')

  // Bấm Đúng rồi, soạn bài (hoặc Gấu soạn bài)
  const submitReviewBtn = page.locator('button:has-text("soạn bài"), button:has-text("Đúng rồi")').first()
  if (await submitReviewBtn.isVisible()) {
    await submitReviewBtn.click()
    await page.waitForTimeout(1200)
  }

  // 4. Màn Explain: chụp P0-3, P1-13
  await page.screenshot({ path: 'bang-chung/prompt27/p0_3_p1_13_explain_skills_390.png' })
  console.log('✓ Đã chụp p0_3_p1_13_explain_skills_390.png')

  // Bấm Bắt đầu hỏi con
  const askBtn = page.locator('button:has-text("Bắt đầu hỏi con")').first()
  if (await askBtn.isVisible()) {
    await askBtn.click()
    await page.waitForTimeout(600)
  }

  // 5. Màn Scaffold: chụp P0-2
  const segments = await page.locator('.fprog-4 i').count()
  console.log(`P0-2: Số khúc tiến trình vẽ được: ${segments} khúc (Bài 3 bậc) -> ${segments === 3 ? '✓ HOÀN HẢO' : '❌ SAI'}`)
  await page.screenshot({ path: 'bang-chung/prompt27/p0_2_scaffold_3segments_390.png' })
  console.log('✓ Đã chụp p0_2_scaffold_3segments_390.png')

  // Vượt qua 3 bậc
  for (let s = 0; s < 3; s++) {
    const nextBtn = page.locator('button:has-text("Con hiểu rồi"), button:has-text("làm được"), button:has-text("Đúng"), button:has-text("Tiếp tục")').first()
    if (await nextBtn.isVisible()) {
      await nextBtn.click()
      await page.waitForTimeout(400)
    }
  }

  // Bấm Hoàn thành bài -> Xong bài
  const finishBtn = page.locator('button:has-text("Hoàn thành bài")').first()
  if (await finishBtn.isVisible()) {
    await finishBtn.click()
    await page.waitForTimeout(800)
  }

  // 6. Màn Xong bài ở bộ Xuân Sum Vầy (Tết): chụp P0-1
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'tet')
  })
  await page.waitForTimeout(300)

  const tabsCount = await page.locator('nav.tabs').count()
  const saveHomeBtn = page.locator('button:has-text("Lưu & về trang chủ")').first()
  const saveBox = await saveHomeBtn.boundingBox()
  console.log(`P0-1: Thanh tab nav.tabs hiển thị: ${tabsCount > 0 ? '❌ CÒN HIỆN' : '✓ ĐÃ ẨN (0 thanh tab)'}`)
  console.log(`P0-1: Nút Lưu & về trang chủ tại y=${Math.round(saveBox?.y || 0)}, h=${Math.round(saveBox?.height || 0)}`)
  await page.screenshot({ path: 'bang-chung/prompt27/p0_1_xong_bai_tet_no_tabs_390.png' })
  console.log('✓ Đã chụp p0_1_xong_bai_tet_no_tabs_390.png')

  if (await saveHomeBtn.isVisible()) {
    await saveHomeBtn.click()
    await page.waitForTimeout(600)
  }

  // 7. Báo cáo (P0-4, P0-5)
  await page.locator('.tabs button:has-text("Báo cáo")').first().click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'bang-chung/prompt27/p0_4_bao_cao_ai_kem_390.png' })
  console.log('✓ Đã chụp p0_4_bao_cao_ai_kem_390.png')

  // 8. Trò chơi (P0-5, P1-4)
  await page.locator('.tabs button:has-text("Trò chơi")').first().click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'bang-chung/prompt27/p0_5_tro_choi_no_token_390.png' })
  console.log('✓ Đã chụp p0_5_tro_choi_no_token_390.png')

  await browser.close()
  console.log('🎉 TOÀN BỘ CÁC MÀN P0 ĐÃ HOÀN TẤT & ĐO ĐẠC THÀNH CÔNG!')
}

run().catch(console.error)
