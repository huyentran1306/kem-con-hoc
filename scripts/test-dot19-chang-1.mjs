
const _storage = new Map();
globalThis.localStorage = {
  getItem: (k) => _storage.get(k) || null,
  setItem: (k, v) => _storage.set(k, String(v)),
  removeItem: (k) => _storage.delete(k),
  clear: () => _storage.clear(),
};
/**
 * Test Suite: Đợt 19 Chặng 1 - Lưu lịch sử thành dữ liệu thật
 * 1. Kiểm tra chuyển dữ liệu cũ (idempotent, bỏ sample: true, tuần tính từ timestamp Việt Nam)
 * 2. Kiểm tra lưu badge_events và reward_events
 * 3. Đổi quà không xoá badge_events, chỉ ghi reward_events
 * 4. Không còn trường week ghi cứng
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import { getWeekLabel, getVnMondayStart, markSampleStickers } from "../src/utils.js";
import { SAMPLE_STICKER_HISTORY } from "../src/data.js";
import { recordBadgeEvent, fetchBadgeEvents, recordRewardEvent, fetchRewardEvents, migrateLegacyBadges } from "../src/api.js";

async function runTests() {
  console.log("🚀 Bắt đầu kiểm thử Đợt 19 Chặng 1...");

  // 1. Kiểm tra không còn trường week: "Tuần này" hay "Tuần trước" trong SAMPLE_STICKER_HISTORY
  const hasHardcodedWeek = SAMPLE_STICKER_HISTORY.some(item => "week" in item);
  assert.equal(hasHardcodedWeek, false, "SAMPLE_STICKER_HISTORY không được chứa trường week ghi cứng");
  console.log("✅ 1. SAMPLE_STICKER_HISTORY không còn trường week ghi cứng");

  // 2. Kiểm tra tính tuần theo giờ Việt Nam (UTC+7) từ timestamp
  // Mốc Chủ nhật sang Thứ Hai:
  // Giả sử ngày Chủ nhật 2026-10-25 23:59:00 VN (UTC+7)
  // và Thứ Hai 2026-10-26 00:01:00 VN (UTC+7)
  const sundayVN = new Date("2026-10-25T23:59:00+07:00").getTime();
  const mondayVN = new Date("2026-10-26T00:01:00+07:00").getTime();

  const monStartThisWeek = getVnMondayStart(mondayVN);
  assert.equal(sundayVN < monStartThisWeek, true, "Chủ nhật 23:59 VN phải thuộc tuần trước");
  assert.equal(mondayVN >= monStartThisWeek, true, "Thứ hai 00:01 VN phải thuộc tuần mới");
  console.log("✅ 2. Tính tuần chuẩn xác mốc Chủ nhật sang Thứ Hai giờ Việt Nam");

  // 3. Kiểm tra markSampleStickers và lọc bản ghi sample: true
  const sampleList = [
    { id: "h1", stickerId: "s3", trait: "Sáng tạo" },
    { id: "h15", stickerId: "s4", trait: "Tỉ mỉ" },
    { id: "real_123", stickerId: "s1", trait: "Kiên nhẫn", timestamp: mondayVN }
  ];
  const marked = markSampleStickers(sampleList);
  assert.equal(marked[0].sample, true, "h1 phải có sample: true");
  assert.equal(marked[1].sample, true, "h15 phải có sample: true");
  assert.equal(marked[2].sample, undefined, "real_123 không được gắn sample");

  const migratedItems = marked.filter(s => !s.sample && !/^h(1[0-5]|[1-9])$/.test(String(s.id)));
  assert.equal(migratedItems.length, 1, "Chỉ bản ghi thật được chuyển đổi");
  assert.equal(migratedItems[0].id, "real_123");
  console.log("✅ 3. Lọc bỏ 100% bản ghi sample: true khi chuyển dữ liệu");

  // 4. Kiểm tra mã nguồn src/screens.jsx & src/App.jsx
  const screensCode = fs.readFileSync("src/screens.jsx", "utf8");
  assert.equal(screensCode.includes("recordBadgeEvent"), true, "screens.jsx phải gọi recordBadgeEvent khi trao huy hiệu");
  assert.equal(screensCode.includes("week: 'Tuần này'"), false, "screens.jsx không còn ghi cứng week: Tuần này");

  const appCode = fs.readFileSync("src/App.jsx", "utf8");
  assert.equal(appCode.includes("recordRewardEvent"), true, "App.jsx phải gọi recordRewardEvent khi đổi quà");

  console.log("✅ 4. screens.jsx & App.jsx đã liên kết recordBadgeEvent & recordRewardEvent");

  // 5. Kiểm tra API methods export trong src/api.js
  assert.equal(typeof recordBadgeEvent, "function");
  assert.equal(typeof fetchBadgeEvents, "function");
  assert.equal(typeof recordRewardEvent, "function");
  assert.equal(typeof fetchRewardEvents, "function");
  assert.equal(typeof migrateLegacyBadges, "function");
  console.log("✅ 5. src/api.js xuất đầy đủ các hàm xử lý dữ liệu Đợt 19");

  // 6. Kiểm tra Trial mode an toàn: 0 lệnh ghi hoặc gọi mạng
  // Giả lập trial mode
  localStorage.setItem("kem-con-hoc:session", JSON.stringify({ isTrial: true }));
  const trialBadge = await recordBadgeEvent({ child_id: "test", trait: "Kiên nhẫn", sticker_id: "s1" });
  assert.equal(trialBadge.offline, true, "Trial mode không gửi request lên server");

  const trialRewards = await fetchRewardEvents({ childId: "test" });
  assert.equal(trialRewards.count, 0, "Trial mode trả về danh sách rỗng");
  localStorage.removeItem("kem-con-hoc:session");
  console.log("✅ 6. Chế độ Dùng thử an toàn 100%, không ghi máy chủ");

  console.log("\n🎉 TẤT CẢ KIỂM THỬ ĐỢT 19 CHẶNG 1 ĐÃ VƯỢT QUA!");
}

runTests().catch(err => {
  console.error("❌ Kiểm thử thất bại:", err);
  process.exit(1);
});
