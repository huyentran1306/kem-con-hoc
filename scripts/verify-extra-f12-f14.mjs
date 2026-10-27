import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";

const OUT_DIR = path.resolve("bang-chung/prompt23k");

async function run() {
  const preview = spawn("npx", ["vite", "preview", "--port", "4173"], { stdio: "pipe" });
  await new Promise(resolve => setTimeout(resolve, 2000));

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. F12: Admin Analytics Tab
    console.log("Testing F12: Admin Analytics Tab...");
    const adminCtx = await browser.newContext({ viewport: { width: 1200, height: 800 } });
    const adminPage = await adminCtx.newPage();
    await adminPage.goto("http://localhost:4173/#admin", { waitUntil: "networkidle" });
    await adminPage.waitForTimeout(800);
    // Switch to analytics tab if available or evaluate
    await adminPage.evaluate(() => {
      const tabBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Phân tích học tập"));
      if (tabBtn) tabBtn.click();
    });
    await adminPage.waitForTimeout(600);
    await adminPage.screenshot({ path: path.join(OUT_DIR, "F12_admin_analytics_kpi_empty_state.png") });
    console.log("-> Saved F12_admin_analytics_kpi_empty_state.png");
    await adminCtx.close();

    // 2. F14: Teacher Portal Results
    console.log("Testing F14: Teacher Portal Results Clean Run...");
    const teacherCtx = await browser.newContext({ viewport: { width: 1200, height: 800 } });
    const teacherPage = await teacherCtx.newPage();
    await teacherPage.goto("http://localhost:4173/#teacher", { waitUntil: "networkidle" });
    await teacherPage.waitForTimeout(800);
    // Click on Results / Kết quả tab
    await teacherPage.evaluate(() => {
      const resBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Kết quả"));
      if (resBtn) resBtn.click();
    });
    await teacherPage.waitForTimeout(600);
    await teacherPage.screenshot({ path: path.join(OUT_DIR, "F14_teacher_results_clean_run.png") });
    console.log("-> Saved F14_teacher_results_clean_run.png");
    await teacherCtx.close();

  } finally {
    await browser.close();
    preview.kill();
  }
}

run().catch(e => {
  console.error("Extra test error:", e);
  process.exit(1);
});
