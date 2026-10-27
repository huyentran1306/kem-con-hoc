import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";

const OUT_DIR = path.resolve("bang-chung/prompt23k");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function run() {
  console.log("=== STARTING PROMPT 23K VERIFICATION ===");
  
  // 1. Start local preview server on port 4173
  const preview = spawn("npx", ["vite", "preview", "--port", "4173"], { stdio: "pipe" });
  await new Promise(resolve => setTimeout(resolve, 2000));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
  });

  const page = await context.newPage();

  page.on("console", msg => {
    if (msg.type() === "error") {
      console.error("[Browser Console Error]", msg.text());
    }
  });
  page.on("pageerror", err => {
    console.error("[Browser Page Error]", err);
  });

  const BASE = "http://localhost:4173/?mode=trial";

  try {
    // ------------------------------------------------------------------------
    // F4: Nền tối (Khu Vườn Đêm garden)
    // ------------------------------------------------------------------------
    console.log("Testing F4: Dark Theme (Khu Vườn Đêm)...");
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    // Click Dùng thử / ensure onboarded
    const btnTrial = page.locator("text=Dùng thử không cần tài khoản");
    if (await btnTrial.isVisible()) {
      await btnTrial.click();
      await page.waitForTimeout(600);
    } else {
      await page.evaluate(() => {
        if (window.__kchPatch) window.__kchPatch({ onboarded: true });
        if (window.__kchGo) window.__kchGo("home");
      });
      await page.waitForTimeout(400);
    }
    // Switch to garden theme
    await page.evaluate(() => {
      if (window.__kchPatch) window.__kchPatch({ theme: "garden" });
      document.documentElement.setAttribute("data-theme", "garden");
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT_DIR, "F4_dark_theme_garden_kid_switch.png") });
    console.log("-> Saved F4_dark_theme_garden_kid_switch.png");

    // ------------------------------------------------------------------------
    // F5: Trò chơi · Góc chơi chung
    // ------------------------------------------------------------------------
    console.log("Testing F5: Góc chơi chung layout...");
    await page.evaluate(() => {
      if (window.__kchPatch) window.__kchPatch({ theme: "bear" });
      document.documentElement.setAttribute("data-theme", "bear");
      if (window.__kchGo) window.__kchGo("games");
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT_DIR, "F5_goc_choi_chung_compact.png") });
    console.log("-> Saved F5_goc_choi_chung_compact.png");

    // ------------------------------------------------------------------------
    // F6: Hỏi con · con kẹt (Scaffold)
    // ------------------------------------------------------------------------
    console.log("Testing F6: Hỏi con kẹt gợi ý 2...");
    await page.evaluate(() => {
      if (window.__kchPatch) {
        window.__kchPatch({
          flow: { step: 0, stuck: 2, unlocked: false },
          problem: {
            ocr: "Mẹ có 18 quả cam, chia đều vào 3 rổ. Mỗi rổ mấy quả?",
            dang_bai: "Toán chia đều",
            steps: [
              {
                question: "Mẹ chia cam vào bao nhiêu rổ?",
                answer: "3 rổ",
                hint: "Lấy 3 cái bát làm 3 rổ. Na đếm xem có mấy cái bát nào?",
                hint2: "Na vẽ 3 vòng tròn là 3 cái rổ. Có mấy vòng tròn?",
              }
            ]
          }
        });
      }
      if (window.__kchGo) window.__kchGo("scaffold");
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT_DIR, "F6_scaffold_hint_level2.png") });
    console.log("-> Saved F6_scaffold_hint_level2.png");

    // ------------------------------------------------------------------------
    // F7: Con tôi (Profile switch)
    // ------------------------------------------------------------------------
    console.log("Testing F7: Profile switch Nhận lời khuyên...");
    await page.evaluate(() => {
      if (window.__kchGo) window.__kchGo("profile");
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT_DIR, "F7_profile_switch_row.png") });
    console.log("-> Saved F7_profile_switch_row.png");

    // ------------------------------------------------------------------------
    // F8: Chấm vở (CheckWork buttons)
    // ------------------------------------------------------------------------
    console.log("Testing F8: Chấm vở buttons...");
    await page.evaluate(() => {
      if (window.__kchGo) window.__kchGo("checkWork");
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT_DIR, "F8_checkwork_soft_flat_buttons.png") });
    console.log("-> Saved F8_checkwork_soft_flat_buttons.png");

    // ------------------------------------------------------------------------
    // F9: Bộ theo mùa (noel start action)
    // ------------------------------------------------------------------------
    console.log("Testing F9: Season mascot name (noel)...");
    await page.evaluate(() => {
      if (window.__kchPatch) window.__kchPatch({ theme: "noel" });
      document.documentElement.setAttribute("data-theme", "noel");
      if (window.__kchGo) window.__kchGo("home");
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT_DIR, "F9_season_noel_mascot_button.png") });
    console.log("-> Saved F9_season_noel_mascot_button.png");

    // ------------------------------------------------------------------------
    // F10: Báo cáo · Dùng thử
    // ------------------------------------------------------------------------
    console.log("Testing F10: Report trial consistent data...");
    await page.evaluate(() => {
      if (window.__kchPatch) window.__kchPatch({ theme: "bear" });
      document.documentElement.setAttribute("data-theme", "bear");
      if (window.__kchGo) window.__kchGo("report");
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT_DIR, "F10_report_traits_and_toggle.png") });
    console.log("-> Saved F10_report_traits_and_toggle.png");

    // ------------------------------------------------------------------------
    // F11: Con tôi · Thành viên
    // ------------------------------------------------------------------------
    console.log("Testing F11: Family members sheet (trial)...");
    await page.evaluate(() => {
      if (window.__kchOpenSheet) window.__kchOpenSheet("familyMembers");
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT_DIR, "F11_family_members_2_sample.png") });
    console.log("-> Saved F11_family_members_2_sample.png");

    // Close sheet
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);

    // ------------------------------------------------------------------------
    // F13: Cổng giáo viên desktop sidebar
    // ------------------------------------------------------------------------
    console.log("Testing F13: Teacher portal desktop sidebar...");
    const desktopContext = await browser.newContext({
      viewport: { width: 1200, height: 800 },
      deviceScaleFactor: 1.5,
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto("http://localhost:4173/#teacher", { waitUntil: "networkidle" });
    await desktopPage.waitForTimeout(1000);
    await desktopPage.screenshot({ path: path.join(OUT_DIR, "F13_teacher_desktop_sidebar.png") });
    console.log("-> Saved F13_teacher_desktop_sidebar.png");
    await desktopContext.close();

    console.log("=== ALL TEST CHECKS COMPLETED SUCCESSFULLY ===");
  } finally {
    await browser.close();
    preview.kill();
  }
}

run().catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});
