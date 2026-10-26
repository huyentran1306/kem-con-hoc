import { chromium } from '@playwright/test'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const OUT_DIR = path.resolve('bang-chung/dot-23/chang-1')
fs.mkdirSync(OUT_DIR, { recursive: true })

async function startPreviewServer(port = 4175) {
  const srv = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
    stdio: 'pipe',
  })
  await new Promise((res) => setTimeout(res, 1500))
  return srv
}

async function run() {
  console.log('🚀 KIỂM THỬ CHẶNG 1: T1 NÚT PHẲNG MỀM & T2 THẺ (11 BỘ GIAO DIỆN)...')
  const PORT = 4175
  const srv = await startPreviewServer(PORT)
  const baseUrl = `http://localhost:${PORT}`

  const browser = await chromium.launch({ headless: true })
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await context.newPage()

    await page.goto(`${baseUrl}/#/dev/ui-kit`)
    await page.waitForTimeout(1000)

    // Chụp ảnh xem bộ Bạn Gấu
    await page.screenshot({ path: path.join(OUT_DIR, 'uikit-bear.png') })
    console.log('  ✓ Đã chụp ảnh UI Kit bộ Bạn Gấu')

    // Bấm xem cả 11 bộ cùng lúc
    const btnAll = page.locator('button:has-text("Xem cả 11 bộ cùng lúc")')
    if (await btnAll.isVisible()) {
      await btnAll.click()
      await page.waitForTimeout(800)
      await page.screenshot({ path: path.join(OUT_DIR, 'uikit-11-themes-matrix.png'), fullPage: true })
      console.log('  ✓ Đã chụp ảnh lưới 11 bộ giao diện cùng lúc')
    }

    // Chụp riêng 3 bộ Bạn Gấu, Khu Vườn Đêm, Đêm Tuyết theo viewport mobile 390px
    const mContext = await browser.newContext({ viewport: { width: 390, height: 844 } })
    const mPage = await mContext.newPage()
    await mPage.goto(`${baseUrl}/#/dev/ui-kit`)
    await mPage.waitForTimeout(800)

    // Bear
    await mPage.screenshot({ path: path.join(OUT_DIR, '390-bear.png') })
    console.log('  ✓ Đã chụp ảnh 390px bộ Bạn Gấu')

    // Garden
    const btnGarden = mPage.locator('button:has-text("Khu Vườn Đêm")')
    if (await btnGarden.isVisible()) {
      await btnGarden.click()
      await mPage.waitForTimeout(400)
      await mPage.screenshot({ path: path.join(OUT_DIR, '390-garden.png') })
      console.log('  ✓ Đã chụp ảnh 390px bộ Khu Vườn Đêm')
    }

    // Noel
    const btnNoel = mPage.locator('button:has-text("Đêm Tuyết")')
    if (await btnNoel.isVisible()) {
      await btnNoel.click()
      await mPage.waitForTimeout(400)
      await mPage.screenshot({ path: path.join(OUT_DIR, '390-noel.png') })
      console.log('  ✓ Đã chụp ảnh 390px bộ Đêm Tuyết')
    }

    console.log('\n🎉 HOÀN THÀNH KIỂM THỬ CHẶNG 1!')
  } finally {
    await browser.close()
    srv.kill()
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
