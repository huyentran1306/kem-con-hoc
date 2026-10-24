/* ============================================================
   KÈM CON HỌC — CALM CORNER DATA & HELPERS
   Prompt 08: Góc hạ hoả mới
   ============================================================ */

export const DEFAULT_CALM_RULES = {
  stuck_repeat: 2,
  step_minutes: 4,
  max_per_problem: 1,
  max_per_night: 2,
  snooze_minutes: 10,
}

export const CALM_REASONS = [
  {
    id: 'not_understood',
    emoji: '🤔',
    title: 'Con chưa hiểu',
    desc: 'Mở gợi ý đồ vật thật hoặc hạ độ khó',
    action: 'hint',
  },
  {
    id: 'distracted',
    emoji: '🦋',
    title: 'Con mất tập trung',
    desc: 'Trò vận động 2 phút cho não tỉnh táo',
    action: 'move',
  },
  {
    id: 'frustrated',
    emoji: '😮‍💨',
    title: 'Mẹ đang mệt, bực',
    desc: 'Thổi cùng con 3 lượt rồi nhận câu nói hợp bài',
    action: 'blow',
  },
  {
    id: 'late',
    emoji: '🌙',
    title: 'Muộn rồi',
    desc: 'Lưu bài lại đi ngủ, vẫn tính một tối học',
    action: 'stop',
  },
]

export const CALM_MOVEMENT_GAMES = [
  { id: 'g1', title: 'Nhảy lò cò 10 bước quanh bàn', emoji: '🦘', desc: 'Con và mẹ cùng nhảy lò cò 10 bước quanh bàn' },
  { id: 'g2', title: 'Tìm 3 đồ vật màu đỏ trong phòng', emoji: '🔴', desc: 'Ai tìm được 3 đồ màu đỏ trước là thắng nha!' },
  { id: 'g3', title: 'Làm tượng đá bất động 15 giây', emoji: '🗿', desc: 'Bất động 15 giây, ai nhúc nhích trước là thua' },
  { id: 'g4', title: 'Vỗ tay theo nhịp: 1-2, 1-2-3', emoji: '👏', desc: 'Mẹ vỗ nhịp 1-2, con vỗ đáp lại 1-2-3' },
  { id: 'g5', title: 'Đứng một chân chim hồng hạc', emoji: '🦩', desc: 'Đứng co một chân đếm từ 1 tới 10 xem ai vững hơn' },
  { id: 'g6', title: 'Chạm mũi chạm tai chéo 5 lần', emoji: '👂', desc: 'Tay trái chạm mũi, tay phải chạm tai rồi đổi chéo' },
  { id: 'g7', title: 'Vươn vai hái sao trên trời', emoji: '⭐', desc: 'Nhón chân lên cao, vươn 2 tay hái 5 ngôi sao tưởng tượng' },
  { id: 'g8', title: 'Lắc lư như chú chim cánh cụt', emoji: '🐧', desc: 'Hai tay áp sát đùi, lắc lư hai bên 20 giây' },
  { id: 'g9', title: 'Xoay cổ tay và lắc cổ chân', emoji: '🔄', desc: 'Xoay nhẹ cổ tay và lắc cổ chân giải phóng năng lượng' },
  { id: 'g10', title: 'Nhắm mắt đếm chậm từ 1 đến 10', emoji: '🧘', desc: 'Nhắm mắt lại, hít sâu và cùng đếm thầm từ 1 tới 10' },
  { id: 'g11', title: 'Đi nhón chân nhẹ như mèo con', emoji: '🐾', desc: 'Đi rón rén một vòng quanh phòng không phát ra tiếng động' },
  { id: 'g12', title: 'Hát một câu ca vui nhộn cùng con', emoji: '🎵', desc: 'Cùng hát vang một câu hát vui nhộn mà con thích' },
]

export const FALLBACK_CALM_PHRASES = {
  not_understood: [
    {
      thay_vi_noi: 'Sao mẹ giảng mãi con vẫn không hiểu thế?',
      thu_noi: 'Bài này có chỗ hơi lắt léo nè. Mình lấy mấy chiếc kẹo ra làm que tính xem sao nha?',
      viec_lam_ngay: 'Lấy đồ vật trong nhà ra xếp thành các nhóm nhỏ',
    },
    {
      thay_vi_noi: 'Tập trung vào, câu dễ thế này mà không làm được!',
      thu_noi: 'Chỗ này mẹ thấy hơi rối một xíu. Con thử vẽ ra nháp cho mẹ xem con nghĩ thế nào nha.',
      viec_lam_ngay: 'Vẽ sơ đồ hoặc hình tròn đơn giản ra nháp',
    },
  ],
  distracted: [
    {
      thay_vi_noi: 'Con ngồi yên xem nào, mắt nhìn đi đâu đấy?',
      thu_noi: 'Não con đang muốn giải lao tí xíu đó. Hai mẹ con mình đứng lên vươn vai 1 phút cho tỉnh nha!',
      viec_lam_ngay: 'Vươn vai và nhảy lò cò 10 bước',
    },
    {
      thay_vi_noi: 'Cứ nghịch ngợm thế này thì bao giờ mới xong bài!',
      thu_noi: 'Mình thi xem ai tìm được 3 đồ vật màu đỏ trong phòng nhanh hơn, rồi quay lại chiến tiếp!',
      viec_lam_ngay: 'Trò chơi tìm đồ vật 1 phút',
    },
  ],
  frustrated: [
    {
      thay_vi_noi: 'Mẹ mệt mỏi với con lắm rồi đấy nhé!',
      thu_noi: 'Mẹ xin lỗi, tự nhiên mẹ hơi mệt một xíu. Hai mẹ con mình cùng uống ngụm nước rồi thở dài một hơi thật êm nha.',
      viec_lam_ngay: 'Mẹ uống ngụm nước ấm và thở dài kép 3 lần',
    },
    {
      thay_vi_noi: 'Học với hành thế này làm mẹ phát điên lên mất!',
      thu_noi: 'Hai mẹ con mình cùng ngồi tựa lưng nghỉ 30 giây nha. Mẹ cần nạp lại pin một chút xíu.',
      viec_lam_ngay: 'Ngồi tựa lưng nhắm mắt thả lỏng vai',
    },
  ],
  late: [
    {
      thay_vi_noi: 'Làm mãi không xong thế này thì bao giờ mới được ngủ?',
      thu_noi: 'Hôm nay con đã rất cố gắng vượt qua các bậc rồi. Dừng ở đây cũng là một tối học rất tốt. Mình đi ngủ, mai làm tiếp nha!',
      viec_lam_ngay: 'Lưu bài lại và cất sách vở vào cặp',
    },
    {
      thay_vi_noi: 'Thôi dẹp đi không học nữa, mai cô phạt ráng chịu!',
      thu_noi: 'Muộn rồi, sức khoẻ của con là quan trọng nhất. Mình lưu lại bậc này, mai tỉnh táo làm tiếp sẽ vèo cái là xong ngay.',
      viec_lam_ngay: 'Gấp vở lại và chúc con ngủ ngon',
    },
  ],
}

/**
 * Kiểm tra câu nói AI có bị lộ đáp án của bài không
 */
export function checkAnswerLeakage(text, problem, currentStepIndex = 0) {
  if (!text || !problem) return false
  const ansStep = String(problem.steps?.[currentStepIndex]?.a || problem.steps?.[currentStepIndex]?.answer || '')
  const ansFinal = String(problem.answer || problem.dap_an_cuoi_cho_me || '')

  // Lấy các số trong đáp án
  const extractNumbers = (str) => (str.match(/\d+/g) || []).filter((n) => n.length >= 1)
  const stepNums = extractNumbers(ansStep)
  const finalNums = extractNumbers(ansFinal)
  const allAnsNums = [...new Set([...stepNums, ...finalNums])]

  // Lấy các số trong đề bài để miễn trừ (nếu số đã có trong đề bài thì được nhắc)
  const problemText = (problem.ocr || '') + ' ' + (problem.question || '') + ' ' + (problem.steps?.[currentStepIndex]?.q || '')
  const problemNums = new Set(extractNumbers(problemText))

  // Nếu số đáp án KHÔNG có trong đề bài mà lại xuất hiện trong text -> LỘ ĐÁP ÁN!
  for (const num of allAnsNums) {
    if (!problemNums.has(num)) {
      const regex = new RegExp(`\\b${num}\\b`)
      if (regex.test(text)) {
        return true // Phát hiện lộ đáp án!
      }
    }
  }
  return false
}
