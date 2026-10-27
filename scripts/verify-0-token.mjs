import { chromium } from "playwright";

async function verify0Token() {
  console.log("Checking 0 Token for Dot 24 games...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  const aiRequests = [];
  page.on("request", (req) => {
    const url = req.url();
    if (url.includes("/chat") || url.includes("/ai") || url.includes("generativelanguage") || url.includes("anthropic")) {
      aiRequests.push(url);
    }
  });

  await page.goto("http://localhost:4175");
  await page.waitForTimeout(500);

  const btnTrial = page.locator("button:has-text(\"Dùng thử\")");
  if (await btnTrial.count() > 0 && await btnTrial.isVisible()) {
    await btnTrial.click();
    await page.waitForTimeout(500);
  }

  await page.click("button:has-text(\"Trò chơi\")");
  await page.waitForTimeout(500);

  // Chơi nhanh cả 3 trò
  await page.click("[data-testid=\"btn-game-duel\"]");
  await page.waitForTimeout(600);
  await page.click("button:has-text(\"‹\")");
  await page.waitForTimeout(400);

  await page.click("[data-testid=\"btn-game-tree\"]");
  await page.waitForTimeout(600);
  await page.click("button:has-text(\"‹\")");
  await page.waitForTimeout(400);

  await page.click("[data-testid=\"btn-game-detective\"]");
  await page.waitForTimeout(600);
  await page.click("button:has-text(\"‹\")");
  await page.waitForTimeout(400);

  await browser.close();

  console.log("Total AI Requests:", aiRequests.length);
  if (aiRequests.length === 0) {
    console.log("PASS: 100% 0 token, không có bất kỳ request LLM nào!");
  } else {
    console.error("FAIL: Có request AI:", aiRequests);
    process.exit(1);
  }
}

verify0Token().catch((e) => {
  console.error(e);
  process.exit(1);
});
