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
        cau_hoi: 'Con hãy đọc to đề bài và chỉ cho mẹ: Bác Ba ban đầu có tất cả bao nhiêu con vịt nào?',
        dap_an_cho_me: 'Xác định số lượng ban đầu là 15 con vịt.',
        goi_y: {
          muc_1_do_vat: 'Lấy 15 que tính hoặc cúc áo xếp ra bàn để tượng trưng cho đàn vịt.',
          muc_2_hinh_ve: 'Vẽ 15 chấm tròn hoặc một đoạn thẳng biểu diễn 15 con vịt.',
        },
      },
      {
        bac: 2,
        cau_hoi: 'Bác Ba bán bớt đi nghĩa là bớt đi hay thêm vào, và bớt đi mấy con hả con?',
        dap_an_cho_me: 'Bán bớt tức là làm phép trừ, bớt đi 6 con.',
        goi_y: {
          muc_1_do_vat: 'Tách 6 que tính ra khỏi 15 que tính ban đầu.',
          muc_2_hinh_ve: 'Gạch chéo 6 chấm tròn trên hình vẽ.',
        },
      },
      {
        bac: 3,
        cau_hoi: 'Đếm lại số que tính còn lại trên bàn, hoặc viết phép tính để tìm số vịt còn lại nào!',
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
        dap_an_cho_me: 'Cây cối mọc mầm non mới, người ta gọi là nảy lộc.',
        goi_y: {
          muc_1_do_vat: 'Nhìn vào mầm cây ngoài ban công hoặc chậu hoa trong nhà.',
          muc_2_hinh_ve: 'Hình dung chồi non màu xanh biếc nhú ra từ cành cây.',
        },
      },
      {
        bac: 2,
        cau_hoi: "Từ 'nảy lộc' thì tiếng 'nảy' con đặt đầu lưỡi chạm vào đâu khi phát âm nào?",
        dap_an_cho_me: "Âm 'n' đầu lưỡi chạm vòm họng trên, âm 'l' uốn lưỡi.",
        goi_y: {
          muc_1_do_vat: 'Con soi gương hoặc sờ tay vào cánh mũi khi phát âm n-n-nảy.',
          muc_2_hinh_ve: 'Phân biệt chữ n thấp (1 nét móc) và chữ l cao (nét khuyết).',
        },
      },
      {
        bac: 3,
        cau_hoi: 'Bây giờ con hãy điền chữ cái đúng vào từng vị trí và đọc lại thật xuôi nhé!',
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
        dap_an_cho_me: 'Đây là con mèo của mình (danh từ chỉ con vật số ít).',
        goi_y: {
          muc_1_do_vat: 'Chỉ vào bạn mèo bông hoặc con mèo quen thuộc.',
          muc_2_hinh_ve: 'Nhìn vào từ cat = chú mèo.',
        },
      },
      {
        bac: 2,
        cau_hoi: "Ở câu thứ hai, mình muốn nói 'Tên của NÓ là Mimi', thì từ nào mang nghĩa 'của nó' hả con?",
        dap_an_cho_me: "Phân biệt 'Its' (của nó) với 'It\\'s' (viết tắt của It is = Nó là).",
        goi_y: {
          muc_1_do_vat: 'So sánh với: My name (tên của tôi), Your name (tên của bạn), Its name (tên của nó).',
          muc_2_hinh_ve: "Chữ 'Its' chỉ sở hữu KHÔNG có dấu phẩy trên đầu.",
        },
      },
      {
        bac: 3,
        cau_hoi: "Bây giờ con tự tin khoanh tròn đáp án đúng nhất để hoàn thiện câu nào!",
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
        stickerHistory: [
          { id: 'stk_1', name: 'Ngôi sao chăm chỉ', earnedAt: now - 86400000 * 3 },
          { id: 'stk_2', name: 'Bạn Ong siêng năng', earnedAt: now - 86400000 * 2 },
          { id: 'stk_3', name: 'Bông sen kiên nhẫn', earnedAt: now - 86400000 * 1 },
        ],
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
    problem: {
      type: 'Toán có lời văn',
      dang_bai: 'Toán có lời văn phép trừ',
      ocr: PRELOADED_TRIAL_LESSONS[0].de_bai,
      steps: PRELOADED_TRIAL_LESSONS[0].cac_bac.map((b) => ({
        question: b.cau_hoi,
        answerForParent: b.dap_an_cho_me,
        answer: b.dap_an_cho_me,
        hint: b.goi_y.muc_1_do_vat,
        hintLevel1: b.goi_y.muc_1_do_vat,
        hintLevel2: b.goi_y.muc_2_hinh_ve,
        stuck: 0,
      })),
      finalAnswerForParent: PRELOADED_TRIAL_LESSONS[0].dap_an_cuoi_cho_me,
    },
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

export function matchTrialLesson(text = '') {
  if (!text) return PRELOADED_TRIAL_LESSONS[0];
  const s = String(text).toLowerCase();
  if (s.includes('vịt') || s.includes('bán') || s.includes('15')) {
    return PRELOADED_TRIAL_LESSONS[0];
  }
  if (s.includes('mùa xuân') || s.includes('lộc') || s.includes('chính tả') || s.includes('chồi')) {
    return PRELOADED_TRIAL_LESSONS[1];
  }
  if (s.includes('cat') || s.includes('mimi') || s.includes('its') || s.includes('english')) {
    return PRELOADED_TRIAL_LESSONS[2];
  }
  // Mặc định trả về bài toán đàn vịt chuẩn
  return PRELOADED_TRIAL_LESSONS[0];
}
