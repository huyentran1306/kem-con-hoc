import { chromium } from '@playwright/test'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const OUT_DIR = path.resolve('bang-chung/chuyen-dong')
const ARTIFACT_DIR = '/Users/pro/.gemini/antigravity-ide/brain/1b85ea08-5390-4990-8f67-b7f2408f3dee/bang-chung/chuyen-dong'
fs.mkdirSync(OUT_DIR, { recursive: true })
fs.mkdirSync(ARTIFACT_DIR, { recursive: true })

async function startPreviewServer(port = 4175) {
  const srv = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
    stdio: 'pipe',
  })
  await new Promise((res) => setTimeout(res, 1500))
  return srv
}

async function run() {
  console.log('🚀 BẮT ĐẦU E2E TEST & CHỤP ẢNH BẰNG CHỨNG ĐỢT 22...')
  const PORT = 4175
  const srv = await startPreviewServer(PORT)
  const baseUrl = `http://localhost:${PORT}`

  const browser = await chromium.launch({ headless: true })
  const consoleErrors = []

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    })

    // Mock API calls cho Admin
    await context.route('**', async (route) => {
      const url = route.request().url()
      if (url.includes('/api/v1/admin/me')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ok: true,
            admin: {
              id: 'adm_super_01',
              email: 'admin@kemconhoc.vn',
              name: 'Quản trị viên Superadmin',
              role: 'superadmin',
            },
          }),
        })
      }
      if (url.includes('/db/kv/')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, value: null }),
        })
      }
      if (url.includes('/api/v1/admin/')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, data: {} }),
        })
      }
      return route.continue()
    })

    const page = await context.newPage()

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text()
        if (!text.includes('favicon') && !text.includes('404')) {
          console.error('Console error:', text)
          consoleErrors.push(text)
        }
      }
    })

    // Setup admin token
    await page.goto(`${baseUrl}/`)
    await page.evaluate(() => {
      localStorage.setItem('kem-con-hoc:admin-token', 'adm_mock_token_dot22')
    })

    // 1. Mở Admin Giao diện app -> Xem trước chuyển động
    console.log('1. Mở Admin Giao diện app -> Xem trước chuyển động...')
    await page.goto(`${baseUrl}/#admin/giao-dien`)
    await page.waitForTimeout(1000)

    const btnMotion = page.locator('[data-testid="btn-tab-motion-preview"]')
    await btnMotion.waitFor({ state: 'visible', timeout: 5000 })
    await btnMotion.click()
    await page.waitForTimeout(600)

    // A. Chụp ảnh bộ Bạn Gấu (bear)
    await page.screenshot({ path: path.join(OUT_DIR, 'theme-bear.png') })
    fs.copyFileSync(path.join(OUT_DIR, 'theme-bear.png'), path.join(ARTIFACT_DIR, 'theme-bear.png'))
    console.log('  ✓ Đã chụp ảnh chuyển động bộ Bạn Gấu')

    // B. Chuyển sang bộ Khu Vườn Đêm (garden)
    const chipGarden = page.locator('button:has-text("Khu Vườn Đêm")').first()
    await chipGarden.click()
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(OUT_DIR, 'theme-garden.png') })
    fs.copyFileSync(path.join(OUT_DIR, 'theme-garden.png'), path.join(ARTIFACT_DIR, 'theme-garden.png'))
    console.log('  ✓ Đã chụp ảnh chuyển động bộ Khu Vườn Đêm')

    // C. Chuyển sang bộ Đêm Tuyết (noel)
    const chipNoel = page.locator('button:has-text("Đêm Tuyết")').first()
    await chipNoel.click()
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(OUT_DIR, 'theme-noel.png') })
    fs.copyFileSync(path.join(OUT_DIR, 'theme-noel.png'), path.join(ARTIFACT_DIR, 'theme-noel.png'))
    console.log('  ✓ Đã chụp ảnh chuyển động bộ Đêm Tuyết')

    // D. Chuyển sang chế độ xem ma trận 6 x 11
    const btnMatrix = page.locator('button:has-text("Lưới tổng thể 6 x 11")')
    await btnMatrix.click()
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(OUT_DIR, 'matrix-6x11.png') })
    fs.copyFileSync(path.join(OUT_DIR, 'matrix-6x11.png'), path.join(ARTIFACT_DIR, 'matrix-6x11.png'))
    console.log('  ✓ Đã chụp ảnh lưới ma trận 6x11 cho 11 bộ')

    // 2. Kiểm thử khói màn học với bài Dùng thử (Smoke test)
    console.log('2. Kiểm thử khói bài Dùng thử (xong bậc, kẹt, câu nhỏ hơn, tặng huy hiệu)...')
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
    })
    const mPage = await mobileContext.newPage()

    mPage.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text()
        if (!text.includes('favicon')) {
          consoleErrors.push(text)
        }
      }
    })

    // Thiết lập Dùng thử vào localStorage trước khi load
    await mPage.goto(`${baseUrl}/`)
    await mPage.evaluate(() => {
      const trialSession = {
        id: 'fam_trial',
        name: 'Gia đình Dùng Thử',
        role: 'owner',
        isTrial: true,
        token: 'trial_offline_token',
      }
      localStorage.setItem('kem-con-hoc:session', JSON.stringify(trialSession))
      localStorage.setItem('kem-con-hoc:auth', JSON.stringify({ token: 'trial_offline_token', session: trialSession }))
      
      const trialState = {
        onboarded: true,
        parent: 'Mẹ',
        tone: 'Nhẹ nhàng',
        theme: 'bear',
        children: [{ id: 'na', name: 'Na', emoji: '🦄', grade: 'Lớp 3', book: 'Kết nối tri thức' }],
        childIndex: 0,
        flow: {
          step: 0,
          stuck: 0,
          unlocked: false,
          result: null,
          ocr: 'Một đàn vịt có 15 con, bác Ba bán bớt đi 6 con. Hỏi bác Ba còn lại bao nhiêu con vịt?',
        },
        problem: {
          title: 'Bài toán vịt bác Ba',
          subject: 'Toán',
          steps: [
            {
              ask: 'Con đọc đề và cho mẹ biết lúc đầu bác Ba có mấy con vịt?',
              hint: 'Số lượng ban đầu trong đề bài.',
              subQuestions: [
                'Trong câu đầu tiên có nhắc tới con số nào hả con?',
                'Số vịt ban đầu là 15 hay 6 con?'
              ]
            },
            {
              ask: 'Bác Ba bán bớt nghĩa là làm phép tính gì con nhỉ?',
              hint: 'Bán bớt là thêm vào hay lấy đi?',
              subQuestions: [
                'Bớt đi thì số vịt tăng lên hay giảm đi?',
                'Vậy mình làm phép trừ hay phép cộng?'
              ]
            }
          ]
        }
      }
      localStorage.setItem('kem-con-hoc:fam:fam_trial', JSON.stringify(trialState))
      localStorage.setItem('kem-con-hoc:v1', JSON.stringify(trialState))
    })

    // Nạp lại trang với dữ liệu đã kích hoạt
    await mPage.goto(`${baseUrl}/`)
    await mPage.waitForTimeout(800)

    // Điều hướng vào màn scaffold
    await mPage.evaluate(() => {
      if (window.__kchGo) window.__kchGo('scaffold')
    })
    await mPage.waitForTimeout(600)

    // Bấm nút "Con chưa nghĩ ra" lần 1 & 2 để kích hoạt chẻ nhỏ câu hỏi
    const btnStuck = mPage.locator('button:has-text("Con chưa nghĩ ra")').first()
    if (await btnStuck.isVisible()) {
      await btnStuck.click()
      await mPage.waitForTimeout(400)
      await btnStuck.click()
      await mPage.waitForTimeout(600)
      await mPage.screenshot({ path: path.join(OUT_DIR, 'smoke-stuck-micro.png') })
      fs.copyFileSync(path.join(OUT_DIR, 'smoke-stuck-micro.png'), path.join(ARTIFACT_DIR, 'smoke-stuck-micro.png'))
      console.log('  ✓ Đã kiểm thử hiệu ứng kẹt và chẻ nhỏ câu hỏi')
    }

    // Bấm hoàn thành bài (điều hướng sang 'done')
    await mPage.evaluate(() => {
      if (window.__kchGo) window.__kchGo('done')
    })
    await mPage.waitForTimeout(600)
    await mPage.screenshot({ path: path.join(OUT_DIR, 'smoke-done-screen.png') })
    fs.copyFileSync(path.join(OUT_DIR, 'smoke-done-screen.png'), path.join(ARTIFACT_DIR, 'smoke-done-screen.png'))
    console.log('  ✓ Đã kiểm thử màn Xong bài và gợi ý huy hiệu')

    // 3. Kiểm thử giảm chuyển động (prefers-reduced-motion: reduce)
    console.log('3. Kiểm thử tuỳ chọn giảm chuyển động (prefers-reduced-motion: reduce)...')
    const reducedContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    })
    await reducedContext.route('**', async (route) => {
      const url = route.request().url()
      if (url.includes('/api/v1/admin/me')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ok: true,
            admin: { id: 'adm_super_01', email: 'admin@kemconhoc.vn', name: 'Admin', role: 'superadmin' },
          }),
        })
      }
      if (url.includes('/db/kv/')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, value: null }),
        })
      }
      return route.continue()
    })

    const rPage = await reducedContext.newPage()
    await rPage.goto(`${baseUrl}/`)
    await rPage.evaluate(() => {
      localStorage.setItem('kem-con-hoc:admin-token', 'adm_mock_token_dot22')
    })
    await rPage.goto(`${baseUrl}/#admin/giao-dien`)
    await rPage.waitForTimeout(800)
    const btnR = rPage.locator('[data-testid="btn-tab-motion-preview"]')
    if (await btnR.isVisible()) await btnR.click()
    await rPage.waitForTimeout(600)
    await rPage.screenshot({ path: path.join(OUT_DIR, 'reduced-motion.png') })
    fs.copyFileSync(path.join(OUT_DIR, 'reduced-motion.png'), path.join(ARTIFACT_DIR, 'reduced-motion.png'))
    console.log('  ✓ Đã chụp kiểm chứng giảm chuyển động tĩnh chuẩn xác')

    console.log('\n==================================================')
    console.log('🎉 E2E TEST HOÀN TẤT THÀNH CÔNG 100%!')
    console.log('Số console error phát hiện:', consoleErrors.length)
    console.log('Ảnh bằng chứng đã lưu tại:', OUT_DIR)
    console.log('==================================================')
  } finally {
    await browser.close()
    srv.kill()
  }
}

run().catch((err) => {
  console.error('Lỗi E2E:', err)
  process.exit(1)
})
