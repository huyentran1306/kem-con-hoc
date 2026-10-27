import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const PROOF_DIR = path.resolve("bang-chung/dot-24/bear");
const ARTIFACT_DIR = "/Users/pro/.gemini/antigravity-ide/brain/1b85ea08-5390-4990-8f67-b7f2408f3dee";

if (!fs.existsSync(PROOF_DIR)) {
  fs.mkdirSync(PROOF_DIR, { recursive: true });
}

async function testDot24() {
  console.log("🚀 KIỂM THỬ TỰ ĐỘNG ĐỢT 14 - GÓC CHƠI CHUNG (3 TRÒ MẸ CON): http://localhost:4175");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  await page.goto("http://localhost:4175");
  await page.waitForTimeout(600);

  // Nhấn Dùng thử nếu có
  const btnTrial = page.locator("button:has-text(\"Dùng thử\")");
  if (await btnTrial.count() > 0 && await btnTrial.isVisible()) {
    await btnTrial.click();
    await page.waitForTimeout(600);
  }

  // 1. CHẶNG 1: Mở tab Trò chơi -> Thấy Góc chơi chung
  console.log("\n--- 1. Kiểm tra Màn Góc chơi chung ---");
  await page.click("button:has-text(\"Trò chơi\")");
  await page.waitForTimeout(800);

  const hasGocChoi = await page.locator("[data-testid=\"screen-goc-choi-chung\"]").count();
  console.log("Màn Góc chơi chung xuất hiện:", hasGocChoi > 0 ? "PASS" : "FAIL");
  if (hasGocChoi === 0) throw new Error("FAIL: Không thấy màn Góc chơi chung!");

  await page.screenshot({ path: path.join(PROOF_DIR, "1_goc_choi_chung.png") });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "dot24_1_goc_choi_chung.png") });
  console.log("📸 Đã chụp: 1_goc_choi_chung.png");

  // 2. CHẶNG 2: Trò Đấu trí hai đầu bàn
  console.log("\n--- 2. Kiểm tra Trò 1: Đấu trí hai đầu bàn ---");
  await page.click("[data-testid=\"btn-game-duel\"]");
  await page.waitForTimeout(800);

  const hasDuelPlay = await page.locator("[data-testid=\"screen-duel-playing\"]").count();
  console.log("Màn Đấu trí đang chơi xuất hiện:", hasDuelPlay > 0 ? "PASS" : "FAIL");
  if (hasDuelPlay === 0) throw new Error("FAIL: Không vào được màn Đấu trí!");

  await page.screenshot({ path: path.join(PROOF_DIR, "2_dau_tri_dang_choi.png") });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "dot24_2_dau_tri_dang_choi.png") });
  console.log("📸 Đã chụp: 2_dau_tri_dang_choi.png");

  // Vượt qua 6 vòng Đấu trí
  for (let r = 1; r <= 6; r++) {
    const btns = page.locator("[data-testid=\"screen-duel-playing\"] div:last-child button");
    const count = await btns.count();
    for (let b = 0; b < count; b++) {
      await btns.nth(b).click().catch(() => {});
    }
    await page.waitForTimeout(1400);
  }

  const hasDuelOver = await page.locator("[data-testid=\"screen-duel-gameover\"]").count();
  console.log("Màn Đấu trí hết ván xuất hiện:", hasDuelOver > 0 ? "PASS" : "FAIL");
  if (hasDuelOver === 0) throw new Error("FAIL: Không vào được màn Đấu trí hết ván!");

  await page.screenshot({ path: path.join(PROOF_DIR, "3_dau_tri_het_van.png") });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "dot24_3_dau_tri_het_van.png") });
  console.log("📸 Đã chụp: 3_dau_tri_het_van.png");

  await page.click("button:has-text(\"Về góc chơi\")");
  await page.waitForTimeout(800);

  // 3. CHẶNG 3: Trò Leo cây mật ong
  console.log("\n--- 3. Kiểm tra Trò 2: Leo cây mật ong ---");
  await page.click("[data-testid=\"btn-game-tree\"]");
  await page.waitForTimeout(800);

  const hasTreePlay = await page.locator("[data-testid=\"screen-honey-tree-playing\"]").count();
  console.log("Màn Leo cây đang chơi xuất hiện:", hasTreePlay > 0 ? "PASS" : "FAIL");
  if (hasTreePlay === 0) throw new Error("FAIL: Không vào được màn Leo cây!");

  await page.screenshot({ path: path.join(PROOF_DIR, "4_leo_cay_dang_choi.png") });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "dot24_4_leo_cay_dang_choi.png") });
  console.log("📸 Đã chụp: 4_leo_cay_dang_choi.png");

  // Vượt qua 8 bậc
  for (let step = 1; step <= 10; step++) {
    if (await page.locator("[data-testid=\"screen-honey-tree-won\"]").count() > 0) break;
    const opts = page.locator("[data-testid=\"screen-honey-tree-playing\"] button.btn-km-primary");
    const count = await opts.count();
    for (let i = 0; i < count; i++) {
      await opts.nth(i).click().catch(() => {});
    }
    await page.waitForTimeout(600);
  }

  const hasTreeWon = await page.locator("[data-testid=\"screen-honey-tree-won\"]").count();
  console.log("Màn Leo cây tới đích xuất hiện:", hasTreeWon > 0 ? "PASS" : "FAIL");
  if (hasTreeWon === 0) throw new Error("FAIL: Không tới đích được trong Leo cây!");

  await page.screenshot({ path: path.join(PROOF_DIR, "5_leo_cay_toi_dich.png") });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "dot24_5_leo_cay_toi_dich.png") });
  console.log("📸 Đã chụp: 5_leo_cay_toi_dich.png");

  await page.click("button:has-text(\"Nghỉ thôi\")");
  await page.waitForTimeout(800);

  // 4. CHẶNG 4: Trò Thám tử đồ vật
  console.log("\n--- 4. Kiểm tra Trò 3: Thám tử đồ vật ---");
  await page.click("[data-testid=\"btn-game-detective\"]");
  await page.waitForTimeout(800);

  const hasDetectivePlay = await page.locator("[data-testid=\"screen-detective-playing\"]").count();
  console.log("Màn Thám tử đang chơi xuất hiện:", hasDetectivePlay > 0 ? "PASS" : "FAIL");
  if (hasDetectivePlay === 0) throw new Error("FAIL: Không vào được màn Thám tử!");

  await page.screenshot({ path: path.join(PROOF_DIR, "6_tham_tu_dang_choi.png") });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "dot24_6_tham_tu_dang_choi.png") });
  console.log("📸 Đã chụp: 6_tham_tu_dang_choi.png");

  // Chụp 3 nhóm
  for (let g = 1; g <= 3; g++) {
    const btnSnap = page.locator("button:has-text(\"Chụp nhóm\")").first();
    if (await btnSnap.count() > 0 && await btnSnap.isVisible()) {
      await btnSnap.click();
      await page.waitForTimeout(400);
      const btnConfirm = page.locator("button:has-text(\"Đúng rồi ✓\")").first();
      if (await btnConfirm.count() > 0) {
        await btnConfirm.click();
        await page.waitForTimeout(500);
      }
    }
  }

  const hasSolved = await page.locator("[data-testid=\"screen-detective-solved\"]").count();
  console.log("Màn Phá án thành công xuất hiện:", hasSolved > 0 ? "PASS" : "FAIL");
  if (hasSolved === 0) throw new Error("FAIL: Không vào được màn Phá án!");

  await page.screenshot({ path: path.join(PROOF_DIR, "7_tham_tu_pha_an.png") });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "dot24_7_tham_tu_pha_an.png") });
  console.log("📸 Đã chụp: 7_tham_tu_pha_an.png");

  await page.click("button:has-text(\"Về Góc chơi chung\")");
  await page.waitForTimeout(800);

  // 5. Kiểm tra Cài đặt trong Con tôi
  console.log("\n--- 5. Kiểm tra Cài đặt thời gian chơi trong Con tôi ---");
  await page.click("button:has-text(\"Con tôi\")");
  await page.waitForTimeout(800);

  const hasTimeCard = await page.locator("[data-testid=\"card-game-time-limit\"]").count();
  console.log("Thẻ cài đặt thời gian chơi xuất hiện:", hasTimeCard > 0 ? "PASS" : "FAIL");
  if (hasTimeCard === 0) throw new Error("FAIL: Không thấy thẻ cài đặt thời gian chơi!");

  await page.screenshot({ path: path.join(PROOF_DIR, "8_cai_dat_thoi_gian.png") });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, "dot24_8_cai_dat_thoi_gian.png") });
  console.log("📸 Đã chụp: 8_cai_dat_thoi_gian.png");

  console.log("\n🎉 HOÀN THÀNH XUẤT SẮC TOÀN BỘ 5 CHẶNG ĐỢT 14 (PROMPT 24)!");
  await browser.close();
}

testDot24().catch(e => {
  console.error(e);
  process.exit(1);
});
