import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const OUT_DIR = path.resolve('bang-chung/prompt23t');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function setupPage(context, mini = false) {
  const page = await context.newPage();

  await page.addInitScript((isMini) => {
    localStorage.setItem('kem-con-hoc:admin-token', 'mock_token_valid');
    if (isMini) {
      localStorage.setItem('kem-con-hoc:admin:nav-mini', '1');
    } else {
      localStorage.removeItem('kem-con-hoc:admin:nav-mini');
    }
  }, mini);

  // Route handlers
  await page.route('**/*admin/me*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        admin: {
          id: 'adm_test',
          email: 'admin@kemconhoc.vn',
          display_name: 'Quản trị viên',
          role: 'superadmin',
        }
      })
    });
  });

  await page.route('**/*admin/health*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, status: 'ok', latency_ms: 18 })
    });
  });

  await page.route('**/*admin/todo-counts*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, pendingTeachers: 2, newErrors: 5 })
    });
  });

  await page.route('**/*admin/overview*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, sessions_today: 42, active_users: 15 })
    });
  });

  await page.route('**/*api/v1/config/public*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, aiConfig: { prompt_version: 'v2', pedagogy_routing: [] } })
    });
  });

  return page;
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop 1440px on /admin/router
  console.log('Capturing Desktop 1440px on /admin/router...');
  const ctx1440 = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page1440 = await setupPage(ctx1440, false);
  // Serve via preview or local dev server if running, or load dist
  // Let's use local preview server or file
  await page1440.goto('http://localhost:4173/admin/router', { waitUntil: 'networkidle', timeout: 8000 }).catch(async () => {
    console.log('Fallback to http://localhost:5173/admin/router');
    await page1440.goto('http://localhost:5173/admin/router', { waitUntil: 'networkidle' });
  });

  await page1440.waitForTimeout(1000);
  await page1440.screenshot({ path: path.join(OUT_DIR, '01_desktop_1440_router.png'), fullPage: false });
  console.log('Saved 01_desktop_1440_router.png');

  // 2. Laptop 1100px with Mini Sidebar
  console.log('Capturing Laptop 1100px with Mini Sidebar...');
  const ctx1100 = await browser.newContext({
    viewport: { width: 1100, height: 750 },
    deviceScaleFactor: 2,
  });
  const page1100 = await setupPage(ctx1100, true);
  await page1100.goto('http://localhost:4173/admin/router', { waitUntil: 'networkidle', timeout: 8000 }).catch(async () => {
    await page1100.goto('http://localhost:5173/admin/router', { waitUntil: 'networkidle' });
  });

  await page1100.waitForTimeout(1000);
  await page1100.screenshot({ path: path.join(OUT_DIR, '02_laptop_1100_mini_sidebar.png'), fullPage: false });
  console.log('Saved 02_laptop_1100_mini_sidebar.png');

  // 3. Mobile 390px with Drawer Open
  console.log('Capturing Mobile 390px with Drawer Open...');
  const ctx390 = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const page390 = await setupPage(ctx390, false);
  await page390.goto('http://localhost:4173/admin/router', { waitUntil: 'networkidle', timeout: 8000 }).catch(async () => {
    await page390.goto('http://localhost:5173/admin/router', { waitUntil: 'networkidle' });
  });

  await page390.waitForTimeout(1000);
  // Click hamburger menu button
  const burgerBtn = await page390.$('button[aria-label="Mở thực đơn"], .kadm-drawer-toggle, .kadm-menu-btn, button:has-text("☰")');
  if (burgerBtn) {
    await burgerBtn.click();
    await page390.waitForTimeout(500);
  }
  await page390.screenshot({ path: path.join(OUT_DIR, '03_mobile_390_drawer_open.png'), fullPage: false });
  console.log('Saved 03_mobile_390_drawer_open.png');

  await browser.close();
  console.log('Done capturing all 3 screenshots!');
}

main().catch(console.error);
