import { chromium } from 'playwright'

async function capture() {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  })
  const page = await context.newPage()

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' }).catch(async () => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  })

  // Chọn bộ Bạn Gấu
  await page.evaluate(() => {
    localStorage.setItem('kch_theme', 'bear')
    document.documentElement.setAttribute('data-theme', 'bear')
    if (window.__kchSetTheme) window.__kchSetTheme('bear')
  })
  await page.waitForTimeout(400)

  // 1. Chụp màn chính
  await page.evaluate(() => window.__kchGo && window.__kchGo('home'))
  await page.waitForTimeout(400)
  await page.screenshot({ path: 'bang-chung/prompt23x/01_home_bear_390.png' })
  console.log('✓ Captured bang-chung/prompt23x/01_home_bear_390.png')

  // 2. Chụp màn "Gấu đọc được đề này" (Analyze)
  await page.evaluate(() => window.__kchGo && window.__kchGo('analyze'))
  await page.waitForTimeout(400)
  await page.screenshot({ path: 'bang-chung/prompt23x/02_review_bear_390.png' })
  console.log('✓ Captured bang-chung/prompt23x/02_review_bear_390.png')

  // 3. Chụp màn Xong bài (Done)
  await page.evaluate(() => window.__kchGo && window.__kchGo('done'))
  await page.waitForTimeout(400)
  await page.screenshot({ path: 'bang-chung/prompt23x/03_done_bear_390.png' })
  console.log('✓ Captured bang-chung/prompt23x/03_done_bear_390.png')

  // Kiểm tra font và độ tràn chữ của nút ở khổ 390
  const overflowCheck = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.btn-km, .btn, button'))
    const issues = []
    for (const b of btns) {
      const computed = window.getComputedStyle(b)
      if (b.scrollWidth > b.clientWidth + 1) {
        issues.push({ text: b.innerText, scrollW: b.scrollWidth, clientW: b.clientWidth })
      }
    }
    return issues
  })

  console.log('Overflow check on done screen:', overflowCheck.length === 0 ? '✓ KHÔNG TRÀN CHỮ' : overflowCheck)

  await browser.close()
}

capture().catch(console.error)
