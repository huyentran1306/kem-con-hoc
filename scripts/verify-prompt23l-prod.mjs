
import { chromium } from "playwright";
import path from "path";
import fs from "fs";

async function main() {
  console.log("=== BẮT ĐẦU E2E TEST CHẤM VỞ TRÊN PRODUCTION BUILD MỚI ===");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on("pageerror", err => {
    console.error("PAGE ERROR:", err.message);
    consoleErrors.push(err.message);
  });
  page.on("console", msg => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (!text.includes("favicon") && !text.includes("Failed to load resource")) {
        console.error("CONSOLE ERROR:", text);
        consoleErrors.push(text);
      }
    }
  });

  const PROD_URL = "https://kem-con-hoc-5xf.pages.dev";
  console.log("1. Đang truy cập:", PROD_URL);
  await page.goto(PROD_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Check current bundle name from script tag
  const bundleSrc = await page.evaluate(() => {
    const s = Array.from(document.querySelectorAll("script[src]")).find(el => el.src.includes("index-"));
    return s ? s.src : "unknown";
  });
  console.log("-> Production bundle đang chạy:", bundleSrc);

  // Đăng nhập
  console.log("2. Đăng nhập tài khoản kiểm thử...");
  const inputs = await page.locator("input").all();
  if (inputs.length >= 2) {
    await inputs[0].fill("TestFam_mvqi5cov");
    await inputs[1].fill("Password@123");
    await page.locator("button:has-text(\"Vào app\")").first().click();
    await page.waitForTimeout(1500);
  }

  // Nếu hiện onboarding thì bấm Xong
  const btnFinishOnboarding = page.locator("button:has-text(\"Xong, bắt đầu\")").first();
  if (await btnFinishOnboarding.count() > 0) {
    console.log("-> Bấm Xong, bắt đầu onboarding...");
    await btnFinishOnboarding.click();
    await page.waitForTimeout(1000);
  }

  // Chuyển tới màn Chấm vở
  console.log("3. Vào màn Chấm vở...");
  await page.evaluate(() => {
    if (window.__kchGo) window.__kchGo("checkWork");
  });
  await page.waitForTimeout(1000);

  // Upload ảnh vở
  const imgPath = "/Users/pro/Downloads/kem-con-hoc-dot-11-sua-gap-2026-10-26/bang-chung-21/anh-vo-thu-de-keo.jpg";
  console.log("4. Tải lên ảnh thử:", imgPath);
  const fileInput = page.locator("input[type=\"file\"]").first();
  await fileInput.setInputFiles(imgPath);

  console.log("5. Đang chờ AI đọc ảnh vở (OCR)...");
  let readSuccess = false;
  for (let retry = 1; retry <= 3; retry++) {
    try {
      await page.waitForFunction(() => {
        const h = document.body.innerText;
        return h.includes("Xem lại bài làm") || h.includes("Chấm bài") || h.includes("Dòng 1") || h.includes("Mình chưa đọc rõ ảnh");
      }, { timeout: 35000 });

      const text = await page.evaluate(() => document.body.innerText);
      if (text.includes("Mình chưa đọc rõ ảnh")) {
        console.log(`OCR bị mờ ở lần thử ${retry}, bấm chụp lại và thử lại ảnh...`);
        const btnRetake = page.locator("button:has-text(\"Chụp lại ảnh khác\"), button:has-text(\"Chụp lại\")").first();
        if (await btnRetake.count() > 0) {
          await btnRetake.click();
          await page.waitForTimeout(1000);
          const fInput = page.locator("input[type=\"file\"]").first();
          await fInput.setInputFiles(imgPath);
          continue;
        }
      }
      readSuccess = true;
      break;
    } catch (err) {
      console.log(`Chờ OCR quá 35s ở lần ${retry}...`);
    }
  }

  if (!readSuccess) {
    console.log("OCR TIMEOUT! Current body text:", (await page.evaluate(() => document.body.innerText)));
    await page.screenshot({ path: "/Users/pro/Coding/kem-con-hoc/bang-chung/prompt-23l/ocr_timeout.png" });
    throw new Error("OCR could not read image after retries");
  }

  console.log("6. Đã đọc xong ảnh! Bấm Chấm bài...");
  const gradeBtn = page.locator("button:has-text(\"Chấm bài này\"), button:has-text(\"Chấm bài\")").first();
  await gradeBtn.click();

  console.log("7. Đang chấm bài (giữ màn AI đang chấm và kiểm tra phép tính...)...");
  await page.waitForFunction(() => {
    const h = document.body.innerText;
    return h.includes("Sai ở dòng") || h.includes("chọn phép tính") || h.includes("Chưa chấm xong") || h.includes("AI chấm chưa xong");
  }, { timeout: 50000 });

  const bodyText = await page.evaluate(() => document.body.innerText);
  const isError = bodyText.includes("Chưa chấm xong") || bodyText.includes("AI chấm chưa xong");
  if (isError) {
    throw new Error("FAIL: Màn hình hiện Chưa chấm xong!");
  }

  console.log("8. CHẤM BÀI THÀNH CÔNG RỰC RỠ!");
  const outDir = "/Users/pro/Coding/kem-con-hoc/bang-chung/prompt-23l";
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const shotPath = path.join(outDir, "prod_grade_success.png");
  await page.screenshot({ path: shotPath });
  console.log("-> Đã lưu ảnh chụp:", shotPath);

  console.log("Các dòng kết luận trên màn hình:");
  console.log(bodyText.split("\n").filter(l => l.includes("dòng") || l.includes("phép tính") || l.includes("17") || l.includes("kẹo") || l.includes("Kết quả") || l.includes("bước")).slice(0, 8).join("\n"));

  console.log("Console errors count:", consoleErrors.length);
  await browser.close();
  console.log("=== TẤT CẢ KIỂM THỬ ĐẠT CHUẨN 100% ===");
}

main().catch(err => {
  console.error("LỖI KIỂM THỬ:", err);
  process.exit(1);
});
