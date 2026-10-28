import { validateAllLessonMath } from "./arithmetic.js";
/**
 * DỮ LIỆU VÀ TRẠNG THÁI CHẾ ĐỘ DÙNG THỬ (PROMPT 13 · CHẶNG 6)
 * Chế độ dùng thử không cần tài khoản:
 * - 2 con (Bé Na Lớp 3 & Bé Tít Lớp 1)
 * - Lọ kẹo đã có 3 viên
 * - Báo cáo tuần có số liệu (3 buổi mẹ, 1 buổi bố, 2 lần góc bình yên)
 * - 1 lớp mẫu của Cô Mai với lời nhắc hôm nay
 * - 3 bài soạn sẵn (Toán lời văn, Tiếng Việt, Tiếng Anh)
 * - Hoạt động hoàn toàn offline, KHÔNG gọi AI, KHÔNG gửi ghi máy chủ
 */

export const TRIAL_SESSION = {
  id: 'fam_trial',
  name: 'Gia đình Dùng Thử',
  role: 'owner',
  isTrial: true,
  token: 'trial_offline_token',
};

export const PRELOADED_TRIAL_LESSONS = [
  {
    id: 'lesson_math_3',
    subject: 'Toán',
    grade: 'Lớp 3',
    de_bai: 'Một đàn vịt có 15 con, bác Ba bán bớt đi 6 con. Hỏi bác Ba còn lại bao nhiêu con vịt?',
    phuong_phap: 'Truy vấn gợi mở 3 bậc (Scaffolding)',
    dang_bai: 'Toán có lời văn phép trừ',
    cac_bac: [
      {
        bac: 1,
        ky_nang: 'doc_hieu_de',
        cau_hoi: 'Con hãy đọc to đề bài và chỉ cho mẹ: Bác Ba ban đầu có tất cả bao nhiêu con vịt nào?',
        ly_do_cho_me: 'Giúp con nhận diện dữ kiện số lượng ban đầu của đàn vịt trước khi thực hiện thao tác bớt đi.',
        dap_an_cho_me: 'Xác định số lượng ban đầu là 15 con vịt.',
        goi_y: {
          muc_1_do_vat: 'Lấy 15 que tính hoặc cúc áo xếp ra bàn để tượng trưng cho đàn vịt.',
          muc_2_hinh_ve: 'Vẽ 15 chấm tròn hoặc một đoạn thẳng biểu diễn 15 con vịt.',
        },
      },
      {
        bac: 2,
        ky_nang: 'chon_phep_tinh',
        cau_hoi: 'Bác Ba bán bớt đi nghĩa là bớt đi hay thêm vào, và bớt đi mấy con hả con?',
        ly_do_cho_me: 'Dẫn dắt con hiểu từ khoá "bán bớt" tương ứng với phép toán trừ trong thực tế.',
        dap_an_cho_me: 'Bán bớt tức là làm phép trừ, bớt đi 6 con.',
        goi_y: {
          muc_1_do_vat: 'Tách 6 que tính ra khỏi 15 que tính ban đầu.',
          muc_2_hinh_ve: 'Gạch chéo 6 chấm tròn trên hình vẽ.',
        },
      },
      {
        bac: 3,
        ky_nang: 'tinh_toan',
        cau_hoi: 'Đếm lại số que tính còn lại trên bàn, hoặc viết phép tính để tìm số vịt còn lại nào!',
        ly_do_cho_me: 'Khích lệ con tự thực hiện phép tính và kết luận số lượng còn lại.',
        dap_an_cho_me: 'Phép tính: 15 - 6 = 9 (con vịt). Đáp số: 9 con vịt.',
        goi_y: {
          muc_1_do_vat: 'Đếm từng que tính còn lại trước mặt con.',
          muc_2_hinh_ve: 'Tách 15 thành 10 và 5, lấy 10 trừ 6 còn 4, cộng 5 bằng 9.',
        },
      },
    ],
    dap_an_cuoi_cho_me: 'Bác Ba còn lại 9 con vịt.',
  },
  {
    id: 'lesson_viet_1',
    subject: 'Tiếng Việt',
    grade: 'Lớp 1',
    de_bai: "Điền vào chỗ trống l hay n: 'Mùa xuân, cây cối đâm chồi ...ảy ...ộc, hoa cúc ...ở rộ khắp vườn.'",
    phuong_phap: 'Phân biệt phát âm & Ngữ cảnh',
    dang_bai: 'Chính tả phân biệt L / N',
    cac_bac: [
      {
        bac: 1,
        cau_hoi: 'Con hãy đọc to cả câu văn và xem mùa xuân thì cây cối có điều gì đặc biệt nhé?',
        ly_do_cho_me: 'Kích hoạt ngữ cảnh tự nhiên mùa xuân để con hình dung từ ngữ phù hợp.',
        dap_an_cho_me: 'Cây cối mọc mầm non mới, người ta gọi là nảy lộc.',
        goi_y: {
          muc_1_do_vat: 'Nhìn vào mầm cây ngoài ban công hoặc chậu hoa trong nhà.',
          muc_2_hinh_ve: 'Hình dung chồi non màu xanh biếc nhú ra từ cành cây.',
        },
      },
      {
        bac: 2,
        cau_hoi: "Từ 'nảy lộc' thì tiếng 'nảy' con đặt đầu lưỡi chạm vào đâu khi phát âm nào?",
        ly_do_cho_me: 'Hướng dẫn con khẩu hình chuẩn của phụ âm N đầu lưỡi chạm vòm họng.',
        dap_an_cho_me: "Âm 'n' đầu lưỡi chạm vòm họng trên, âm 'l' uốn lưỡi.",
        goi_y: {
          muc_1_do_vat: 'Con soi gương hoặc sờ tay vào cánh mũi khi phát âm n-n-nảy.',
          muc_2_hinh_ve: 'Phân biệt chữ n thấp (1 nét móc) và chữ l cao (nét khuyết).',
        },
      },
      {
        bac: 3,
        cau_hoi: 'Bây giờ con hãy điền chữ cái đúng vào từng vị trí và đọc lại thật xuôi nhé!',
        ly_do_cho_me: 'Khắc sâu trí nhớ chính tả bằng việc hoàn thành trọn vẹn câu văn.',
        dap_an_cho_me: "Điền lần lượt: 'nảy lộc' (n, l) và 'nở rộ' (n).",
        goi_y: {
          muc_1_do_vat: 'Viết thử ra bảng con trước khi điền vào sách.',
          muc_2_hinh_ve: 'Đọc lại cả câu: đâm chồi nảy lộc, hoa cúc nở rộ.',
        },
      },
    ],
    dap_an_cuoi_cho_me: 'Đúng: nảy lộc (n, l) và nở rộ (n).',
  },
  {
    id: 'lesson_eng_3',
    subject: 'Tiếng Anh',
    grade: 'Lớp 3',
    de_bai: "Choose the correct answer: 'This is my cat. ... name is Mimi.' (A. Its / B. It's / C. It)",
    phuong_phap: 'Nhận diện tính từ sở hữu',
    dang_bai: 'Ngữ pháp Tiếng Anh tiểu học',
    cac_bac: [
      {
        bac: 1,
        cau_hoi: "Con hãy đọc câu đầu tiên: 'This is my cat.' và cho mẹ biết đây là con vật gì nào?",
        ly_do_cho_me: 'Xác định chủ thể con vật số ít để làm nền tảng chọn đại từ sở hữu.',
        dap_an_cho_me: 'Đây là con mèo của mình (danh từ chỉ con vật số ít).',
        goi_y: {
          muc_1_do_vat: 'Chỉ vào bạn mèo bông hoặc con mèo quen thuộc.',
          muc_2_hinh_ve: 'Nhìn vào từ cat = chú mèo.',
        },
      },
      {
        bac: 2,
        cau_hoi: "Ở câu thứ hai, mình muốn nói 'Tên của NÓ là Mimi', thì từ nào mang nghĩa 'của nó' hả con?",
        ly_do_cho_me: 'Phân biệt lỗi kinh điển giữa Its (sở hữu) và It\'s (It is viết tắt).',
        dap_an_cho_me: "Phân biệt 'Its' (của nó) với 'It\\'s' (viết tắt của It is = Nó là).",
        goi_y: {
          muc_1_do_vat: 'So sánh với: My name (tên của tôi), Your name (tên của bạn), Its name (tên của nó).',
          muc_2_hinh_ve: "Chữ 'Its' chỉ sở hữu KHÔNG có dấu phẩy trên đầu.",
        },
      },
      {
        bac: 3,
        cau_hoi: "Bây giờ con tự tin khoanh tròn đáp án đúng nhất để hoàn thiện câu nào!",
        ly_do_cho_me: 'Tự tin chọn đáp án chuẩn xác và đọc to trọn vẹn câu tiếng Anh.',
        dap_an_cho_me: "Đáp án đúng là A. Its. Câu hoàn chỉnh: 'This is my cat. Its name is Mimi.'",
        goi_y: {
          muc_1_do_vat: 'Đọc to cả câu với từ vừa chọn.',
          muc_2_hinh_ve: 'Đối chiếu với đáp án A.',
        },
      },
    ],
    dap_an_cuoi_cho_me: 'Đáp án A. Its (Its name is Mimi).',
  },
];

export function getTrialInitialState() {
  const now = Date.now();
  return {
    onboarded: true,
    parent: 'Mẹ',
    tone: 'Dịu dàng',
    partner: true,
    theme: 'bear',
    motion: 'full',
    cloudSync: false,
    _ts: now,
    children: [
      { id: 'na', name: 'Bé Na', emoji: '🦄', grade: 'Lớp 3', book: 'Kết nối tri thức' },
      { id: 'tit', name: 'Bé Tít', emoji: '🚀', grade: 'Lớp 1', book: 'Cánh diều' },
    ],
    activeId: 'na',
    stats: {
      na: {
        stickers: 3,
        stickersList: [
          { id: 'stk_1', name: 'Ngôi sao chăm chỉ', emoji: '⭐', earnedAt: now - 86400000 * 3 },
          { id: 'stk_2', name: 'Bạn Ong siêng năng', emoji: '🐝', earnedAt: now - 86400000 * 2 },
          { id: 'stk_3', name: 'Bông sen kiên nhẫn', emoji: '🪷', earnedAt: now - 86400000 * 1 },
        ],
        stickerHistory: (() => {
          const list = [];
          const names = {
            "Kiên nhẫn": "Rùa con kiên trì",
            "Sáng tạo": "Ngôi sao Sáng tạo",
            "Tập trung": "Tia chớp Tập trung",
            "Tỉ mỉ": "Kính lúp Tỉ mỉ"
          };
          const d = new Date(now);
          const day = d.getDay();
          const diffToMon = (day === 0 ? -6 : 1) - day;
          const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diffToMon).getTime();
          const oneWeekMs = 7 * 86400000;

          // Bộ dữ liệu chuẩn hoá khớp 100% với Gấu phân tích (Prompt 23K - F10):
          // Tuần này (w=0): Kiên nhẫn 4, Sáng tạo 1, Tập trung 3, Tỉ mỉ 2
          // Tuần trước (w=1): Kiên nhẫn 3, Sáng tạo 5, Tập trung 2, Tỉ mỉ 1
          const weeklyPresets = [
            { "Kiên nhẫn": 4, "Sáng tạo": 1, "Tập trung": 3, "Tỉ mỉ": 2 }, // w=0 (tuần này)
            { "Kiên nhẫn": 3, "Sáng tạo": 5, "Tập trung": 2, "Tỉ mỉ": 1 }, // w=1 (tuần trước)
            { "Kiên nhẫn": 4, "Sáng tạo": 3, "Tập trung": 3, "Tỉ mỉ": 2 }, // w=2
            { "Kiên nhẫn": 3, "Sáng tạo": 4, "Tập trung": 2, "Tỉ mỉ": 1 }, // w=3
            { "Kiên nhẫn": 2, "Sáng tạo": 3, "Tập trung": 3, "Tỉ mỉ": 2 }, // w=4
            { "Kiên nhẫn": 4, "Sáng tạo": 4, "Tập trung": 1, "Tỉ mỉ": 2 }, // w=5
            { "Kiên nhẫn": 3, "Sáng tạo": 2, "Tập trung": 2, "Tỉ mỉ": 1 }, // w=6
            { "Kiên nhẫn": 2, "Sáng tạo": 3, "Tập trung": 1, "Tỉ mỉ": 1 }, // w=7
          ];

          weeklyPresets.forEach((preset, w) => {
            let j = 0;
            for (const [tr, count] of Object.entries(preset)) {
              for (let k = 0; k < count; k++) {
                const t = monday - w * oneWeekMs + (1 + (j % 5)) * 86400000 + 36000000;
                list.push({
                  id: `stk_demo_${w}_${j}`,
                  stickerId: `s${(j % 4) + 1}`,
                  name: names[tr],
                  trait: tr,
                  subject: j % 2 === 0 ? "Toán" : "Tiếng Việt",
                  problemType: "Bài tập rèn luyện",
                  timestamp: t,
                  earnedAt: t,
                  dateStr: new Date(t).toLocaleDateString("vi-VN"),
                });
                j++;
              }
            }
          });
          return list;
        })(),
        weak: [{ n: 'Toán lời văn 2 bước', count: 2 }],
        strong: [{ n: 'Bảng cửu chương 3 & 4', v: 3, t: 3 }],
        history: [
          { txt: 'Toán lời văn: Bác Ba bán vịt', when: 'Hôm qua' },
          { txt: 'Bảng nhân 4: Xếp kẹo đều ngăn', when: '2 ngày trước' },
          { txt: 'Tiếng Anh: Đồ dùng học tập', when: '3 ngày trước' },
        ],
        calmWeek: 2,
        calmLast: 1,
        calmHistory: [now - 86400000 * 2, now - 86400000 * 1],
        sessionsMom: 3,
        sessionsDad: 1,
        studyLog: [
          { id: 's1', ts: now - 86400000 * 3, problemType: 'Toán có lời văn', minutes: 15 },
          { id: 's2', ts: now - 86400000 * 2, problemType: 'Bảng cửu chương', minutes: 15 },
          { id: 's3', ts: now - 86400000 * 1, problemType: 'Tiếng Anh', minutes: 15 },
        ],
      },
      tit: {
        stickers: 2,
        stickersList: [
          { id: 'stk_t1', name: 'Tên lửa vút bay', emoji: '🚀', earnedAt: now - 86400000 * 2 },
          { id: 'stk_t2', name: 'Mầm non xanh', emoji: '🌱', earnedAt: now - 86400000 * 1 },
        ],
        stickerHistory: [],
        weak: [{ n: 'Phân biệt l/n', count: 1 }],
        strong: [{ n: 'Phép cộng trong phạm vi 10', v: 4, t: 4 }],
        history: [{ txt: 'Tiếng Việt: Đâm chồi nảy lộc', when: 'Hôm qua' }],
        calmWeek: 1,
        calmLast: 0,
        calmHistory: [now - 86400000 * 1],
        sessionsMom: 2,
        sessionsDad: 1,
        studyLog: [],
      },
    },
    teacherReminders: [
      {
        id: 'rem_trial_1',
        classId: 'cls_trial_3a',
        className: 'Lớp 3A',
        teacherName: 'Cô Hoàng Thị Mai',
        title: 'Chuẩn bị đồ dùng môn Thủ công',
        content: 'Ngày mai các con mặc đồng phục và mang theo kéo an toàn, hồ dán, giấy màu để học bài xé dán nhé!',
        dueToday: true,
        sentAt: now - 3600000 * 2,
        read: false,
      },
    ],
    flow: {
      step: 0,
      stuck: 0,
      unlocked: false,
      result: null,
      ocr: PRELOADED_TRIAL_LESSONS[0].de_bai,
    },
    problem: trialLessonToProblem(PRELOADED_TRIAL_LESSONS[0]),
  };
}

export function isTrialActive() {
  try {
    const raw = localStorage.getItem('kem-con-hoc:session');
    if (raw) {
      const sess = JSON.parse(raw);
      if (sess?.isTrial) return true;
    }
  } catch {}
  return false;
}

export const TRIAL_LIMIT_MESSAGE = 'Dùng thử chỉ có 3 đề mẫu. Mẹ chọn một đề bên dưới, hoặc đăng ký để AI giảng mọi đề nhé.'

/**
 * Tìm bài mẫu khớp đề. Đợt 15 P1: đề không khớp → null (không còn trả "Bác Ba bán vịt" cho mọi đề).
 * Đề rỗng → bài đầu tiên.
 */
export function matchTrialLesson(text = '') {
  if (!text || !String(text).trim()) return PRELOADED_TRIAL_LESSONS[0];
  const s = String(text).toLowerCase();
  const exact = PRELOADED_TRIAL_LESSONS.find((l) => s.includes(l.de_bai.toLowerCase().slice(0, 30)));
  if (exact) return exact;
  if (s.includes('vịt') || (s.includes('bác ba') && s.includes('bán'))) return PRELOADED_TRIAL_LESSONS[0];
  if (s.includes('mùa xuân') || s.includes('lộc') || s.includes('chồi') || /\bl hay n\b/.test(s)) return PRELOADED_TRIAL_LESSONS[1];
  if (s.includes('mimi') || s.includes('my cat') || /\bits\b/.test(s)) return PRELOADED_TRIAL_LESSONS[2];
  return null;
}

/* ---------- Dữ liệu đầy đủ cho từng đề mẫu (giảng, chấm vở, nghe con giảng lại khớp nhau) ---------- */
export const TRIAL_LESSON_EXTRAS = {
  lesson_math_3: {
    tom_tat: 'Bài trừ một bước: lấy số vịt ban đầu bớt đi số vịt đã bán.',
    luu_y: 'Con hay thấy hai số rồi cộng luôn. Để con tự nói "bán bớt" là nhiều lên hay ít đi, đừng nói hộ chữ "trừ".',
    cach_lop_hoc: 'Lớp 3 tóm tắt bằng sơ đồ đoạn thẳng: đoạn dài 15 con, gạch bớt 6 con, phần còn lại là số cần tìm.',
    dap_an: '15 − 6 = 9 (con vịt)',
    dap_an_dong: 'Bác Ba còn lại 9 con vịt.',
    cham_vo: {
      dong_sai: [
        { so: 1, noi_dung: 'Số vịt còn lại là:', chac_chan: 0.93 },
        { so: 2, noi_dung: '15 + 6 = 21 (con)', chac_chan: 0.64, lua_chon: ['21', '27'] },
        { so: 3, noi_dung: 'Đáp số: 21 con vịt', chac_chan: 0.9 },
      ],
      dong_dung: [
        { so: 1, noi_dung: 'Số vịt còn lại là:', chac_chan: 0.95 },
        { so: 2, noi_dung: '15 - 6 = 9 (con)', chac_chan: 0.95 },
        { so: 3, noi_dung: 'Đáp số: 9 con vịt', chac_chan: 0.95 },
      ],
      cham_sai: {
        ket_qua: 'co_buoc_sai',
        loi_giai_chuan: ['15 - 6 = 9'],
        dong_sai_dau_tien: 2,
        loai_loi: 'chon_phep_tinh',
        giai_thich_cho_me: 'Đề nói bác Ba bán bớt nên số vịt ít đi, con lại làm phép cộng. Lỗi hay gặp khi con chưa đọc kỹ chữ "bán bớt".',
        gia_tri_dung_dong_sai: '9',
        dap_an_dung_cho_me: '9 con vịt',
        loi_khen_cu_the: 'Con viết câu lời giải rõ ràng và ghi đủ đơn vị "con".',
        cau_hoi_cho_con: {
          muc_1: 'Con đọc lại đề nhé: bác Ba bán bớt đi thì đàn vịt nhiều lên hay ít đi?',
          muc_2: 'Mẹ xếp 15 que tính làm đàn vịt, con lấy ra 6 que như bác Ba bán đi, rồi đếm số que còn lại nhé.',
        },
      },
      cham_dung: {
        ket_qua: 'dung_het',
        loi_giai_chuan: ['15 - 6 = 9'],
        dong_sai_dau_tien: null,
        loai_loi: null,
        giai_thich_cho_me: 'Con đã đổi sang phép trừ và tính đúng.',
        gia_tri_dung_dong_sai: null,
        dap_an_dung_cho_me: '9 con vịt',
        loi_khen_cu_the: 'Con tự nhận ra "bán bớt" là phải trừ, giỏi quá!',
        cau_hoi_cho_con: { muc_1: 'Con tự tìm ra chỗ cần sửa rồi đó, con giỏi lắm!', muc_2: '' },
      },
    },
    giang_lai: {
      transcript: 'Đàn vịt có mười lăm con, bác Ba bán bớt sáu con nên con lấy mười lăm trừ sáu còn chín con vịt ạ.',
      tieu_chi: [
        { ma: 'du_kien', dat: true, trich: 'đàn vịt có mười lăm con' },
        { ma: 'phep_tinh', dat: true, trich: 'mười lăm trừ sáu' },
        { ma: 'ket_qua', dat: true, trich: 'còn chín con vịt' },
        { ma: 'vi_sao', dat: true, trich: 'bán bớt sáu con nên con lấy mười lăm trừ sáu' },
      ],
    },
  },
  lesson_viet_1: {
    tom_tat: 'Bài chính tả phân biệt phụ âm đầu l và n theo nghĩa của từ.',
    luu_y: 'Đừng đọc sẵn từ đúng cho con. Cho con nói nghĩa của từ trước rồi mới chọn l hay n.',
    cach_lop_hoc: 'Lớp 1 đọc to cả câu, nhìn khẩu hình và đặt từ vào ngữ cảnh quen thuộc.',
    dap_an: 'nảy lộc · nở rộ',
    dap_an_dong: 'Câu đúng: "cây cối đâm chồi nảy lộc, hoa cúc nở rộ khắp vườn".',
    cham_vo: {
      dong_sai: [
        { so: 1, noi_dung: 'Mùa xuân, cây cối đâm chồi lảy lộc,', chac_chan: 0.86 },
        { so: 2, noi_dung: 'hoa cúc nở rộ khắp vườn.', chac_chan: 0.9 },
      ],
      dong_dung: [
        { so: 1, noi_dung: 'Mùa xuân, cây cối đâm chồi nảy lộc,', chac_chan: 0.92 },
        { so: 2, noi_dung: 'hoa cúc nở rộ khắp vườn.', chac_chan: 0.92 },
      ],
      cham_sai: {
        ket_qua: 'co_buoc_sai',
        loi_giai_chuan: ['nảy lộc', 'nở rộ'],
        dong_sai_dau_tien: 1,
        loai_loi: 'trinh_bay',
        giai_thich_cho_me: 'Con viết "lảy" thay vì "nảy". Tiếng "lộc" con viết đúng.',
        gia_tri_dung_dong_sai: 'nảy',
        dap_an_dung_cho_me: 'nảy lộc, nở rộ',
        loi_khen_cu_the: 'Con viết đúng "lộc" và "nở rộ", chữ đều và rõ.',
        cau_hoi_cho_con: {
          muc_1: 'Con đọc to tiếng đầu ở dòng 1 nhé, đầu lưỡi con chạm vào đâu?',
          muc_2: 'Con soi gương, đọc chậm từng tiếng rồi nhìn lại chữ con viết nhé.',
        },
      },
      cham_dung: {
        ket_qua: 'dung_het',
        loi_giai_chuan: ['nảy lộc', 'nở rộ'],
        dong_sai_dau_tien: null,
        loai_loi: null,
        giai_thich_cho_me: 'Con đã sửa đúng chữ đầu dòng 1.',
        gia_tri_dung_dong_sai: null,
        dap_an_dung_cho_me: 'nảy lộc, nở rộ',
        loi_khen_cu_the: 'Con tự nghe ra âm đầu và sửa lại rất cẩn thận!',
        cau_hoi_cho_con: { muc_1: 'Con tự sửa đúng rồi, giỏi quá!', muc_2: '' },
      },
    },
    giang_lai: {
      transcript: 'Mùa xuân cây ra lá non nên gọi là nảy lộc, nảy viết n còn lộc viết l, hoa nở thì viết n ạ.',
      tieu_chi: [
        { ma: 'du_kien', dat: true, trich: 'mùa xuân cây ra lá non' },
        { ma: 'phep_tinh', dat: true, trich: 'nảy viết n còn lộc viết l' },
        { ma: 'ket_qua', dat: true, trich: 'hoa nở thì viết n' },
        { ma: 'vi_sao', dat: true, trich: 'cây ra lá non nên gọi là nảy lộc' },
      ],
    },
  },
  lesson_eng_3: {
    tom_tat: 'Bài chọn tính từ sở hữu "Its" (của nó) cho con vật số ít.',
    luu_y: 'Con hay nhầm Its với It\'s. Hỏi con "của nó" hay "nó là" trước khi chọn.',
    cach_lop_hoc: 'Lớp 3 đặt cạnh My name, Your name rồi tìm từ có nghĩa "của nó".',
    dap_an: 'A. Its',
    dap_an_dong: 'This is my cat. Its name is Mimi.',
    cham_vo: {
      dong_sai: [{ so: 1, noi_dung: "This is my cat. It's name is Mimi.", chac_chan: 0.84 }],
      dong_dung: [{ so: 1, noi_dung: 'This is my cat. Its name is Mimi.', chac_chan: 0.92 }],
      cham_sai: {
        ket_qua: 'co_buoc_sai',
        loi_giai_chuan: ['Its name is Mimi'],
        dong_sai_dau_tien: 1,
        loai_loi: 'doc_de',
        giai_thich_cho_me: "Con chọn It's (nó là) thay vì Its (của nó). Đây là lỗi rất hay gặp.",
        gia_tri_dung_dong_sai: 'Its',
        dap_an_dung_cho_me: 'A. Its',
        loi_khen_cu_the: 'Con chép câu đúng chính tả và viết hoa đầu câu.',
        cau_hoi_cho_con: {
          muc_1: 'Câu này muốn nói "tên CỦA NÓ" hay "NÓ LÀ" hả con?',
          muc_2: 'Con đọc cạnh nhau: My name, Your name, rồi đến tên của chú mèo nhé.',
        },
      },
      cham_dung: {
        ket_qua: 'dung_het',
        loi_giai_chuan: ['Its name is Mimi'],
        dong_sai_dau_tien: null,
        loai_loi: null,
        giai_thich_cho_me: 'Con đã chọn đúng từ chỉ sở hữu.',
        gia_tri_dung_dong_sai: null,
        dap_an_dung_cho_me: 'A. Its',
        loi_khen_cu_the: 'Con phân biệt được "của nó" và "nó là", tuyệt vời!',
        cau_hoi_cho_con: { muc_1: 'Con tự sửa đúng rồi, giỏi quá!', muc_2: '' },
      },
    },
    giang_lai: {
      transcript: 'Con mèo tên là Mimi, mình nói tên của nó nên chọn Its không có dấu phẩy ạ.',
      tieu_chi: [
        { ma: 'du_kien', dat: true, trich: 'con mèo tên là Mimi' },
        { ma: 'phep_tinh', dat: true, trich: 'tên của nó' },
        { ma: 'ket_qua', dat: true, trich: 'chọn Its' },
        { ma: 'vi_sao', dat: true, trich: 'mình nói tên của nó nên chọn Its' },
      ],
    },
  },
}

const ACTIVE_TRIAL_KEY = 'kem-con-hoc:trial-lesson'
export function setActiveTrialLesson(id) {
  try {
    localStorage.setItem(ACTIVE_TRIAL_KEY, id)
  } catch {}
}
/** Bài mẫu đang học trong Dùng thử (để chấm vở và nghe giảng lại khớp với bài giảng) */
export function getActiveTrialLesson(text = '') {
  const byText = text ? matchTrialLesson(text) : null
  if (byText) return byText
  let id = null
  try {
    id = localStorage.getItem(ACTIVE_TRIAL_KEY)
  } catch {}
  return PRELOADED_TRIAL_LESSONS.find((l) => l.id === id) || PRELOADED_TRIAL_LESSONS[0]
}

/** Chuyển bài mẫu sang đúng dạng "problem" mà màn Giảng / Hỏi từng bước / Xong bài dùng */
export function trialLessonToProblem(lesson) {
  const x = TRIAL_LESSON_EXTRAS[lesson.id] || {}
  return {
    id: 'trial-' + lesson.id,
    trialLessonId: lesson.id,
    type: lesson.dang_bai,
    dang_bai: lesson.dang_bai,
    summary: x.tom_tat || '',
    warning: x.luu_y || '',
    method: x.cach_lop_hoc || lesson.phuong_phap || '',
    ocr: lesson.de_bai,
    de_bai: lesson.de_bai,
    phuong_phap: lesson.phuong_phap,
    cac_bac: lesson.cac_bac,
    steps: lesson.cac_bac.map((b, idx) => ({
      q: b.cau_hoi,
      question: b.cau_hoi,
      ky_nang: b.ky_nang || (idx === 0 ? 'doc_hieu_de' : idx === 1 ? 'chon_phep_tinh' : 'tinh_toan'),
      ly_do_cho_me: b.ly_do_cho_me || '',
      answerForParent: b.dap_an_cho_me,
      answer: b.dap_an_cho_me,
      hint: b.goi_y.muc_1_do_vat,
      hintLevel1: b.goi_y.muc_1_do_vat,
      hintLevel2: b.goi_y.muc_2_hinh_ve,
      hint2: b.goi_y.muc_2_hinh_ve,
      stuck: 0,
    })),
    answer: x.dap_an || lesson.dap_an_cuoi_cho_me,
    answerLine: x.dap_an_dong || '',
    dap_an_cuoi_cho_me: lesson.dap_an_cuoi_cho_me,
    finalAnswerForParent: lesson.dap_an_cuoi_cho_me,
    brotherProblem: null,
    mathVerified: validateAllLessonMath(lesson),
    diagram: null,
  }
}

/** Lời nhắc mẫu của cô — chỉ dùng trong chế độ Dùng thử (đợt 15 P0.C) */
export function getTrialTeacherReminders(childName) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return [
    {
      id: 'rem_demo_1',
      teacher_name: 'Mai',
      class_name: 'Lớp 3A',
      child_name: childName || 'Na',
      message: 'Mai thứ hai, các con mặc đồng phục thể dục và mang vở Toán nhé.',
      target_date: tomorrow.toISOString().slice(0, 10),
      created_at: new Date().toISOString(),
      assignment_id: null,
    },
  ]
}
