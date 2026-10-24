/* ============ DỮ LIỆU MẪU & HẰNG SỐ ============ */

export const PARENT_TYPES = ['Mẹ', 'Bố', 'Ông/Bà']
export const GRADES = ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5']
export const BOOKS = ['Kết nối tri thức', 'Chân trời sáng tạo', 'Cánh Diều']
export const TONES = ['Nhẹ nhàng', 'Vui nhộn', 'Ngắn gọn']
export const EMOJIS = ['🌸', '🦄', '🐰', '🚀', '⭐', '🐯']

export const SUBJECTS = ['Toán', 'Tiếng Việt', 'Tiếng Anh']

/* Bài mẫu: bé Na lớp 3, Kết nối tri thức */
export const PROBLEM = {
  id: 'mock',
  type: 'Toán có lời văn · giải bằng hai bước tính',
  summary: 'Bước 1 tìm tổng số bút, bước 2 trừ đi số bút đã cho.',
  warning:
    'Con hay quên bước 1 và lấy luôn 8 − 5. Để con tự phát hiện "3 hộp" mới là mấu chốt. Đừng làm hộ bước 1.',
  method: 'Vẽ sơ đồ: 3 hộp, mỗi hộp 8 chấm, rồi gạch 5 chấm.',
  ocr: 'Mẹ mua 3 hộp bút, mỗi hộp 8 cây. Mẹ cho Na 5 cây. Hỏi mẹ còn bao nhiêu cây bút?',
  answer: '3 × 8 = 24 · 24 − 5 = 19 cây bút',
  answerLine: 'Mẹ còn 19 cây bút.',
  diagram: { boxes: 3, per: 8, given: 5 },
  steps: [
    {
      q: 'Bài cho mình biết những gì?',
      hint: 'Gợi thêm: "Con đọc lại câu đầu, mẹ mua mấy hộp?"',
      praise: 'Khen cụ thể: "Con tìm đủ 3 thông tin rồi, giỏi quá!"',
      answer: 'Mẹ mua 3 hộp bút, mỗi hộp 8 cây; mẹ cho Na 5 cây. Hỏi mẹ còn bao nhiêu cây bút?',
    },
    {
      q: 'Mẹ có tất cả bao nhiêu cây bút trước khi cho Na?',
      hint: 'Gợi thêm: "Con vẽ 3 cái hộp, mỗi hộp 8 chấm thử xem."',
      praise: '"À, con nhận ra phải tính 3 hộp trước. Đó là bước khó nhất!"',
      answer: '3 × 8 = 24 (cây bút)',
    },
    {
      q: 'Cho Na 5 cây thì số bút nhiều lên hay ít đi? Vậy là phép gì?',
      hint: 'Gợi thêm: "Con gạch 5 chấm trên hình vẽ, còn lại mấy chấm?"',
      praise: '"Đúng rồi, cho đi thì bớt, mình làm phép trừ."',
      answer: 'Ít đi — phép trừ: 24 − 5',
    },
    {
      q: 'Con viết lời giải và phép tính nhé.',
      hint: 'Gợi thêm: "Câu lời giải bắt đầu bằng: Số bút mẹ có là…"',
      praise: '"Con tự làm được cả bài. Mẹ dán sticker nhé!"',
      answer: '3 × 8 = 24 · 24 − 5 = 19 cây bút',
    },
  ],
}

export const STICKERS = ['🦄', '🚀', '🌈', '🐱', '⭐']
export const STICKER_REWARD = 'Đi ăn kem cùng mẹ'

export const ENGLISH_PHRASES = [
  { role: 'Mẹ hỏi', en: "What time is it?" },
  { role: 'Con đáp', en: "It's seven o'clock." },
  { role: 'Khó hơn', en: "It's half past seven." },
]

export const TOYS = [
  { e: '🧴', n: 'Chai / Lọ' },
  { e: '🪮', n: 'Cây lược' },
  { e: '✏️', n: 'Cây bút' },
  { e: '🧱', n: 'Lego' },
  { e: '📏', n: 'Thước kẻ' },
  { e: '🥢', n: 'Que kem' },
  { e: '🍬', n: 'Kẹo' },
  { e: '⏰', n: 'Đồng hồ' },
  { e: '🃏', n: 'Bài' },
  { e: '🍽', n: 'Bát đĩa' },
]

export const CHAT_SAMPLES = [
  'Con vẫn không hiểu, giảng kiểu khác?',
  'Sao phải nhân trước?',
  'Lời giải viết sao cho đúng?',
]

export const CHAT_REPLIES = {
  'Con vẫn không hiểu, giảng kiểu khác?':
    'Thử dùng đồ thật: lấy 3 cái chén, mỗi chén 8 hạt đậu. Cho con tự đếm tất cả, rồi bốc 5 hạt đưa mẹ. Con sẽ "thấy" 2 bước rõ ràng hơn.',
  'Sao phải nhân trước?':
    'Vì 5 cây lấy ra từ TẤT CẢ số bút, không phải từ 1 hộp. Hỏi con: "Na lấy bút từ hộp nào?" để con tự nhận ra.',
  'Lời giải viết sao cho đúng?':
    'Lớp 3 thường viết: "Số bút mẹ mua là: … (cây)". Mẹ nhắc con mỗi phép tính đi kèm 1 câu lời giải và đơn vị.',
}

export const SCHEDULE_DEFAULT = [
  { day: 'T2', owner: 'Mẹ', english: false },
  { day: 'T3', owner: 'Mẹ', english: false },
  { day: 'T4', owner: 'Mẹ', english: false },
  { day: 'T5', owner: 'Bố', english: true },
  { day: 'T6', owner: 'Bố', english: true },
]

export const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6']

export const CALM_LINES = {
  replace: 'Sao dễ thế mà không biết?',
  trySay: 'Bài này lạ ha. Con chỉ mẹ chỗ con thấy khó nhất đi.',
}

/* Cấu trúc JSON khi nối AI thật (1 lần gọi / bài) */
export const AI_CONTRACT = {
  type: 'dạng bài',
  summary: 'tóm tắt cách giải',
  warning: 'cảnh báo cho mẹ',
  method: 'cách lớp đang học',
  steps: [
    { question: '', hint: '', praise: '', answer: '' },
    { question: '', hint: '', praise: '', answer: '' },
    { question: '', hint: '', praise: '', answer: '' },
    { question: '', hint: '', praise: '', answer: '' },
    { question: '', hint: '', praise: '', answer: '' },
    { question: '', hint: '', praise: '', answer: '' },
  ],
  answer: 'đáp án cho mẹ đối chiếu',
}

/* Bộ sưu tập Sticker huy hiệu của con — Chuẩn FontAwesome & Tone-sur-tone */
export const AVAILABLE_STICKERS = [
  { id: 's1', e: '🦄', fa: 'fa-solid fa-mountain', trait: 'Kiên nhẫn', n: 'Kỳ lân Kiên trì', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', desc: 'Không bỏ cuộc trước bài khó' },
  { id: 's2', e: '🚀', fa: 'fa-solid fa-bolt-lightning', trait: 'Tốc độ', n: 'Tên lửa Tốc độ', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', desc: 'Tính toán nhanh và chuẩn xác' },
  { id: 's3', e: '🌟', fa: 'fa-solid fa-lightbulb', trait: 'Sáng tạo', n: 'Ngôi sao Sáng tạo', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', desc: 'Nghĩ ra cách giải độc đáo' },
  { id: 's4', e: '🐼', fa: 'fa-solid fa-compass-drafting', trait: 'Tỉ mỉ', n: 'Gấu trúc Tỉ mỉ', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', desc: 'Trình bày cẩn thận từng bước' },
  { id: 's5', e: '🦁', fa: 'fa-solid fa-shield-heart', trait: 'Tự tin', n: 'Sư tử Tự tin', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', desc: 'Tự tin giải thích đề bài cho mẹ' },
  { id: 's6', e: '🌈', fa: 'fa-solid fa-face-smile-beam', trait: 'Vui vẻ', n: 'Cầu vồng Vui vẻ', color: '#DB2777', bg: '#FDF2F8', border: '#FBCFE8', desc: 'Giữ nụ cười và tinh thần thoải mái' },
  { id: 's7', e: '🐬', fa: 'fa-solid fa-book-open-reader', trait: 'Thông thái', n: 'Cá heo Thông thái', color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD', desc: 'Nắm vững quy tắc và nhớ bài lâu' },
  { id: 's8', e: '👑', fa: 'fa-solid fa-bullseye', trait: 'Tập trung', n: 'Vương miện Tập trung', color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE', desc: 'Tập trung trọn vẹn buổi học 15 phút' },
  { id: 's9', e: '🐝', fa: 'fa-solid fa-clock-rotate-left', trait: 'Chăm chỉ', n: 'Ong vàng Chăm chỉ', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A', desc: 'Tự giác ngồi vào bàn học đúng giờ' },
  { id: 's10', e: '🦉', fa: 'fa-solid fa-brain', trait: 'Tư duy', n: 'Cú mèo Tư duy', color: '#6366F1', bg: '#F5F3FF', border: '#E0E7FF', desc: 'Nhìn ra bản chất bài toán hay' },
  { id: 's11', e: '🐢', fa: 'fa-solid fa-shoe-prints', trait: 'Bền bỉ', n: 'Rùa con Bền bỉ', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', desc: 'Đi từng bước chậm mà cực kỳ chắc' },
  { id: 's12', e: '🏆', fa: 'fa-solid fa-trophy', trait: 'Xuất sắc', n: 'Cúp Vô địch Tuần', color: '#CA8A04', bg: '#FEFCE8', border: '#FEF08A', desc: 'Hoàn thành xuất sắc mục tiêu tuần' },
]

/* Dữ liệu mẫu lịch sử Sticker theo thời gian (Big Data Longitudinal History) */
export const SAMPLE_STICKER_HISTORY = [
  // Tuần trước (Tuần 1): Nhiều sáng tạo, ít kiên nhẫn do bài dễ
  { id: 'h1', stickerId: 's3', name: 'Ngôi sao Sáng tạo', trait: 'Sáng tạo', fa: 'fa-solid fa-lightbulb', color: '#D97706', subject: 'Toán', problemType: 'Số học & phép tính', week: 'Tuần trước', timestamp: Date.now() - 86400000 * 8 },
  { id: 'h2', stickerId: 's3', name: 'Ngôi sao Sáng tạo', trait: 'Sáng tạo', fa: 'fa-solid fa-lightbulb', color: '#D97706', subject: 'Toán', problemType: 'Đố vui que tính', week: 'Tuần trước', timestamp: Date.now() - 86400000 * 8 },
  { id: 'h3', stickerId: 's3', name: 'Ngôi sao Sáng tạo', trait: 'Sáng tạo', fa: 'fa-solid fa-lightbulb', color: '#D97706', subject: 'Tiếng Việt', problemType: 'Đặt câu mở rộng', week: 'Tuần trước', timestamp: Date.now() - 86400000 * 7 },
  { id: 'h4', stickerId: 's3', name: 'Ngôi sao Sáng tạo', trait: 'Sáng tạo', fa: 'fa-solid fa-lightbulb', color: '#D97706', subject: 'Tiếng Anh', problemType: 'Từ vựng đồ vật', week: 'Tuần trước', timestamp: Date.now() - 86400000 * 7 },
  { id: 'h5', stickerId: 's3', name: 'Ngôi sao Sáng tạo', trait: 'Sáng tạo', fa: 'fa-solid fa-lightbulb', color: '#D97706', subject: 'Toán', problemType: 'Hình học phẳng', week: 'Tuần trước', timestamp: Date.now() - 86400000 * 6 },
  { id: 'h6', stickerId: 's1', name: 'Kỳ lân Kiên trì', trait: 'Kiên nhẫn', fa: 'fa-solid fa-mountain', color: '#7C3AED', subject: 'Toán', problemType: 'Toán có lời văn', week: 'Tuần trước', timestamp: Date.now() - 86400000 * 6 },
  { id: 'h7', stickerId: 's1', name: 'Kỳ lân Kiên trì', trait: 'Kiên nhẫn', fa: 'fa-solid fa-mountain', color: '#7C3AED', subject: 'Toán', problemType: 'Toán có lời văn', week: 'Tuần trước', timestamp: Date.now() - 86400000 * 5 },
  { id: 'h8', stickerId: 's1', name: 'Kỳ lân Kiên trì', trait: 'Kiên nhẫn', fa: 'fa-solid fa-mountain', color: '#7C3AED', subject: 'Tiếng Việt', problemType: 'Viết đoạn văn', week: 'Tuần trước', timestamp: Date.now() - 86400000 * 5 },

  // Tuần này (Tuần 2): Kiên nhẫn tăng lên 4, Sáng tạo tụt xuống còn 1 do bài toán khó & lặp dạng
  { id: 'h9', stickerId: 's1', name: 'Kỳ lân Kiên trì', trait: 'Kiên nhẫn', fa: 'fa-solid fa-mountain', color: '#7C3AED', subject: 'Toán', problemType: 'Toán có lời văn 2 bước', week: 'Tuần này', timestamp: Date.now() - 86400000 * 4 },
  { id: 'h10', stickerId: 's1', name: 'Kỳ lân Kiên trì', trait: 'Kiên nhẫn', fa: 'fa-solid fa-mountain', color: '#7C3AED', subject: 'Toán', problemType: 'Toán có lời văn 2 bước', week: 'Tuần này', timestamp: Date.now() - 86400000 * 3 },
  { id: 'h11', stickerId: 's1', name: 'Kỳ lân Kiên trì', trait: 'Kiên nhẫn', fa: 'fa-solid fa-mountain', color: '#7C3AED', subject: 'Toán', problemType: 'Toán có lời văn 2 bước', week: 'Tuần này', timestamp: Date.now() - 86400000 * 2 },
  { id: 'h12', stickerId: 's1', name: 'Kỳ lân Kiên trì', trait: 'Kiên nhẫn', fa: 'fa-solid fa-mountain', color: '#7C3AED', subject: 'Tiếng Việt', problemType: 'Chính tả phân biệt d/gi/r', week: 'Tuần này', timestamp: Date.now() - 86400000 * 1 },
  { id: 'h13', stickerId: 's3', name: 'Ngôi sao Sáng tạo', trait: 'Sáng tạo', fa: 'fa-solid fa-lightbulb', color: '#D97706', subject: 'Toán', problemType: 'Trò chơi đồ vật', week: 'Tuần này', timestamp: Date.now() - 86400000 * 1 },
  { id: 'h14', stickerId: 's8', name: 'Vương miện Tập trung', trait: 'Tập trung', fa: 'fa-solid fa-bullseye', color: '#4F46E5', subject: 'Toán', problemType: 'Luyện tập chung', week: 'Tuần này', timestamp: Date.now() - 3600000 * 5 },
  { id: 'h15', stickerId: 's4', name: 'Gấu trúc Tỉ mỉ', trait: 'Tỉ mỉ', fa: 'fa-solid fa-compass-drafting', color: '#059669', subject: 'Toán', problemType: 'Trình bày vở', week: 'Tuần này', timestamp: Date.now() - 3600000 * 2 },
]

/* Đố vui 5 giây giải tỏa căng thẳng trong lúc chờ AI phân tích */
export const WAITING_QUIZZES = [
  '🔍 Đố con tìm nhanh 3 đồ vật có màu xanh lá trên bàn học?',
  '🧘 Hai mẹ con cùng hít một hơi thật sâu 4 giây và thở ra thật nhẹ nào!',
  '⚡ Con đếm nhẩm lùi từ 10 về 1 xem có nhanh hơn AI quét bài không nhé!',
  '🐶 Đố con: 1 con gà và 1 con chó có tất cả mấy cái chân?',
  '🖐️ Bàn tay con có 5 ngón, vậy cả 2 bàn tay có mấy ngón tất cả?',
  '📐 Đố con: Cuốn vở của con có 4 góc, vậy 2 cuốn vở có mấy góc?',
]