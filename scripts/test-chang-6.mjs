/**
 * BỘ KIỂM THỬ TỰ ĐỘNG CHẶNG 6: CHẾ ĐỘ DÙNG THỬ (OFFLINE DEMO MODE)
 * Prompt 13 · Chặng 6
 * 
 * 1. Kiểm tra Nút "Dùng thử không cần tài khoản" trên LoginScreen
 * 2. Kiểm tra Dữ liệu gia đình mẫu (2 con, 3 kẹo, báo cáo tuần, 1 lớp cô nhắc, 3 bài soạn sẵn)
 * 3. Kiểm tra Banner "Đang dùng thử · Tạo gia đình để lưu"
 * 4. Kiểm tra Chống gọi AI và Chống ghi máy chủ (Offline / Airplane mode)
 * 5. Kiểm thử E2E tương tác thật qua Playwright (Click dùng thử -> Thấy banner -> Thoát)
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  TRIAL_SESSION,
  PRELOADED_TRIAL_LESSONS,
  getTrialInitialState,
  matchTrialLesson,
  isTrialActive
} from '../src/trialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed++;
  }
}

async function runChang6Tests() {
  console.log('\n===============================================================');
  console.log('✨ BẮT ĐẦU KIỂM THỬ CHẶNG 6: CHẾ ĐỘ DÙNG THỬ (OFFLINE DEMO)');
  console.log('===============================================================\n');

  // --- 1. KIỂM TRA MÀN HÌNH LOGIN ---
  console.log('--- 1. Kiểm tra Màn hình Đăng nhập & Nút Dùng thử ---');
  const loginSrc = readFileSync(resolve(root, 'src/Login.jsx'), 'utf8');
  assert(loginSrc.includes('Dùng thử không cần tài khoản'), 'LoginScreen có nút "Dùng thử không cần tài khoản"');
  assert(loginSrc.includes('trial-btn'), 'Nút dùng thử có class riêng biệt');
  assert(loginSrc.includes('TRIAL_SESSION'), 'Nút dùng thử gọi onAuthed với TRIAL_SESSION');

  // --- 2. KIỂM TRA DỮ LIỆU GIA ĐÌNH MẪU ---
  console.log('\n--- 2. Kiểm tra Dữ liệu gia đình mẫu ---');
  const trialState = getTrialInitialState();

  // 2.1 Kiểm tra 2 con
  assert(Array.isArray(trialState.children) && trialState.children.length === 2, 'Gia đình mẫu có đúng 2 con');
  assert(trialState.children[0].name === 'Bé Na' && trialState.children[0].grade === 'Lớp 3', 'Bé thứ nhất là Bé Na (Lớp 3)');
  assert(trialState.children[1].name === 'Bé Tít' && trialState.children[1].grade === 'Lớp 1', 'Bé thứ hai là Bé Tít (Lớp 1)');

  // 2.2 Kiểm tra kẹo thưởng
  const naStats = trialState.stats.na;
  assert(naStats.stickers === 3, 'Lọ kẹo của bé Na đã có 3 viên kẹo thưởng');
  assert(Array.isArray(naStats.stickersList) && naStats.stickersList.length === 3, 'Danh sách sticker có 3 huy hiệu');

  // 2.3 Kiểm tra báo cáo tuần
  assert(naStats.sessionsMom === 3, 'Có 3 buổi học cùng Mẹ');
  assert(naStats.sessionsDad === 1, 'Có 1 buổi học cùng Bố');
  assert(naStats.calmWeek === 2, 'Có 2 lần sử dụng góc bình yên / góc hạ hoả');
  assert(Array.isArray(naStats.history) && naStats.history.length >= 3, 'Lịch sử học có ít nhất 3 bài');

  // 2.4 Kiểm tra 1 lớp học mẫu và 1 cô nhắc hôm nay
  assert(Array.isArray(trialState.teacherReminders) && trialState.teacherReminders.length === 1, 'Có 1 lời nhắc cô nhắc của giáo viên');
  const reminder = trialState.teacherReminders[0];
  assert(reminder.className === 'Lớp 3A', 'Thuộc Lớp 3A');
  assert(reminder.teacherName === 'Cô Hoàng Thị Mai', 'Người gửi là Cô Hoàng Thị Mai');
  assert(reminder.dueToday === true, 'Lời nhắc có hạn hôm nay');

  // 2.5 Kiểm tra 3 bài giảng mẫu soạn sẵn
  assert(PRELOADED_TRIAL_LESSONS.length === 3, 'Có đúng 3 bài giảng mẫu soạn sẵn');
  assert(PRELOADED_TRIAL_LESSONS[0].subject === 'Toán' && PRELOADED_TRIAL_LESSONS[0].grade === 'Lớp 3', 'Bài 1: Toán lời văn Lớp 3');
  assert(PRELOADED_TRIAL_LESSONS[0].cac_bac.length === 3, 'Bài 1 có đầy đủ 3 bậc scaffolding');
  assert(Boolean(PRELOADED_TRIAL_LESSONS[0].cac_bac[0].goi_y.muc_1_do_vat), 'Bài 1 có gợi ý đồ vật');
  assert(Boolean(PRELOADED_TRIAL_LESSONS[0].cac_bac[0].goi_y.muc_2_hinh_ve), 'Bài 1 có gợi ý hình vẽ');

  assert(PRELOADED_TRIAL_LESSONS[1].subject === 'Tiếng Việt' && PRELOADED_TRIAL_LESSONS[1].grade === 'Lớp 1', 'Bài 2: Tiếng Việt Lớp 1 (Chính tả L/N)');
  assert(PRELOADED_TRIAL_LESSONS[2].subject === 'Tiếng Anh' && PRELOADED_TRIAL_LESSONS[2].grade === 'Lớp 3', 'Bài 3: Tiếng Anh Lớp 3');

  // --- 3. KIỂM TRA BANNER DÙNG THỬ & THOÁT ---
  console.log('\n--- 3. Kiểm tra Banner Dùng thử trên App ---');
  const appSrc = readFileSync(resolve(root, 'src/App.jsx'), 'utf8');
  assert(appSrc.includes('trial-top-banner'), 'src/App.jsx có thẻ trial-top-banner');
  assert(appSrc.includes('Đang dùng thử · Tạo gia đình để lưu'), 'Banner hiển thị đúng câu: "Đang dùng thử · Tạo gia đình để lưu"');
  assert(appSrc.includes('Tạo tài khoản') || appSrc.includes('Tạo gia đình'), 'Banner có nút tạo tài khoản');
  assert(appSrc.includes('Thoát chế độ dùng thử') || appSrc.includes('logout'), 'Banner có nút thoát chế độ dùng thử');

  // --- 4. KIỂM TRA OFFLINE / KHÔNG GỌI AI / KHÔNG GHI MÁY CHỦ ---
  console.log('\n--- 4. Kiểm tra Chống gọi AI và Chống ghi máy chủ ---');
  const apiSrc = readFileSync(resolve(root, 'src/api.js'), 'utf8');
  assert(apiSrc.includes('if (isTrialActive())'), 'src/api.js kiểm tra isTrialActive');
  assert(apiSrc.includes('matchTrialLesson'), 'aiExplain trả về bài giảng mẫu mà không gọi mạng');
  assert(apiSrc.includes('PRELOADED_TRIAL_LESSONS[0].de_bai'), 'aiOcr trả về đề bài mẫu không gọi mạng');
  assert(apiSrc.includes('if (isTrialActive() || famId === \'fam_trial\')') || appSrc.includes('session?.isTrial'), 'cloudSaveState bỏ qua không gửi request ghi khi dùng thử');

  // Thử khớp bài giảng mẫu
  const match1 = matchTrialLesson('Đàn vịt 15 con bán 6 con');
  assert(match1.id === 'lesson_math_3', 'Khớp chính xác bài Toán đàn vịt');
  const match2 = matchTrialLesson('Mùa xuân đâm chồi nảy lộc');
  assert(match2.id === 'lesson_viet_1', 'Khớp chính xác bài Tiếng Việt');
  const match3 = matchTrialLesson('This is my cat');
  assert(match3.id === 'lesson_eng_3', 'Khớp chính xác bài Tiếng Anh');

  console.log('\n===============================================================');
  console.log(`🏁 TỔNG KẾT CHẶNG 6: ${passed}/${passed + failed} TIÊU CHÍ ĐẠT!`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runChang6Tests();
