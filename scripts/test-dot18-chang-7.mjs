import assert from "node:assert/strict";
import fs from "node:fs";
import { BUDDY_IDS, BUDDY_NAMES, BUDDY_STATES, buddyInnerSVG, hasBuddyArt } from "../src/themes/buddies/buddyArt.js";
import { BUDDY_QUOTES } from "../src/themes/buddies/buddyQuotes.js";
import { CUSTOM_BUDDIES } from "../src/themes/customPalette.js";
// test resolveBuddyId via customPalette lookup
function resolveBuddyId(themeId) {
  const found = CUSTOM_BUDDIES.find(b => b.autoIcon === themeId);
  return found ? found.id : "bear";
}

console.log("=== ĐỢT 18 · CHẶNG 7: LINH VẬT ĐỘNG ===");

// 1. Bé Cơm Nắm (onigiri) cho bộ Bento
assert.ok(BUDDY_IDS.includes("onigiri"), "BUDDY_IDS must contain onigiri");
assert.equal(BUDDY_NAMES.onigiri, "Bé Cơm Nắm", "onigiri name must be Bé Cơm Nắm");
assert.ok(hasBuddyArt("onigiri"), "hasBuddyArt(onigiri) must be true");

const bentoBuddy = CUSTOM_BUDDIES.find(b => b.autoIcon === "bento");
assert.ok(bentoBuddy, "CUSTOM_BUDDIES must have entry for bento");
assert.equal(bentoBuddy.id, "onigiri", "bento theme must map to onigiri");
assert.equal(resolveBuddyId("bento"), "onigiri", "resolveBuddyId(bento) must return onigiri");
console.log("✓ 1. Bé Cơm Nắm (onigiri) đã đăng ký cho Bento");

// 2. Câu thoại (BUDDY_QUOTES) cho onigiri
assert.ok(BUDDY_QUOTES.onigiri, "BUDDY_QUOTES must have onigiri");
assert.ok(BUDDY_QUOTES.onigiri.hello, "onigiri must have hello quote");
assert.ok(BUDDY_QUOTES.onigiri.nudge, "onigiri must have nudge quote");
assert.ok(BUDDY_QUOTES.onigiri.cheer, "onigiri must have cheer quote");
console.log("✓ 2. Đầy đủ câu thoại hello/nudge/cheer cho onigiri");

// 3. Đủ 9 trạng thái cho cả 11 linh vật (99 tổ hợp SVG)
const states = ["idle", "hello", "reading", "thinking", "cheer", "love", "surprised", "oops", "sleepy"];
for (const id of BUDDY_IDS) {
  for (const st of states) {
    const svg = buddyInnerSVG(id, st);
    assert.ok(svg && svg.length > 20, `SVG for ${id} in state ${st} must be non-empty`);
    assert.ok(svg.includes("bd-root"), `SVG for ${id} in state ${st} must have bd-root`);
  }
}
console.log(`✓ 3. 11 linh vật x 9 trạng thái = ${BUDDY_IDS.length * states.length} tổ hợp SVG hợp lệ`);

// 4. Bong bóng lời nói ở trang chủ (buddy.css & buddySvgs.jsx)
const css = fs.readFileSync("src/themes/buddies/buddy.css", "utf8");
assert.ok(css.includes(".kb-greeter .kb-say{position:absolute;top:calc(100% + 6px)"), "kb-say must be positioned below mascot (top: calc(100% + 6px))");
assert.ok(css.includes("max-width:220px"), "kb-say max-width must be 220px");
assert.ok(css.includes("background:var(--c-surface"), "kb-say must use solid var(--c-surface)");
assert.ok(css.includes("color:var(--c-text"), "kb-say must use var(--c-text)");

const svgsFile = fs.readFileSync("src/themes/buddies/buddySvgs.jsx", "utf8");
assert.ok(svgsFile.includes("t2.current = setTimeout(() => setSay(null), 3000)"), "speech bubble must auto-hide after 3 seconds");
console.log("✓ 4. Bong bóng lời chào đặt dưới linh vật, nền đặc, rộng tối đa 220px, tự ẩn sau 3s");

// 5. data-motion="off"
assert.ok(css.includes('[data-motion="off"] .kbuddy *'), "data-motion=off must disable kbuddy animation");
assert.ok(css.includes('[data-motion="off"] .kbuddy .bd-root{animation:none !important;transform:none !important}'), "data-motion=off must keep body root static");
console.log("✓ 5. Cài đặt tắt chuyển động: đứng yên, vẫn giữ trọn biểu cảm");

// 6. Linh vật phản ứng trong lúc học (Scaffold, Done, Report)
const screens = fs.readFileSync("src/screens.jsx", "utf8");
assert.ok(screens.includes("<ThemeBuddy state={buddyState} size={48} />"), "Scaffold must render 48px ThemeBuddy beside question");
assert.ok(screens.includes("setBuddyState('cheer')"), "Scaffold must set cheer on stepOk");
assert.ok(screens.includes("setBuddyState('thinking')"), "Scaffold must set thinking on stepStuck");
assert.ok(screens.includes("setBuddyState('reading')"), "Scaffold must set reading on microStep");
assert.ok(screens.includes("setBuddyState('surprised')"), "Scaffold must set surprised on sai_huong");

assert.ok(screens.includes('data-testid="done-buddy-art"'), "Done screen must render large buddy art for all non-seasonal themes");
assert.ok(screens.includes("S.flow?.teachBack ? 'love' : 'cheer'"), "Done buddy must switch to love after teachBack");

assert.ok(screens.includes('<ThemeBuddy state="reading" size={52} />'), "Report must show reading buddy while analyzing");
assert.ok(screens.includes('<ThemeBuddy state="oops" size={52} />'), "Report must show oops buddy on error");
console.log("✓ 6. Linh vật phản ứng đồng bộ ở Hỏi con từng bước, Xong bài, và Báo cáo");

console.log("ALL 6 TESTS PASSED FOR CHẶNG 7!");
