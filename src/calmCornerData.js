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
  "not_understood": [
    {
      "thay_vi_noi": "Sao mẹ giảng mãi con vẫn không hiểu thế?",
      "thu_noi": "Bài này có chỗ hơi lắt léo nè. Mình lấy mấy chiếc kẹo ra làm que tính xem sao nha?",
      "viec_lam_ngay": "Lấy đồ vật trong nhà ra xếp thành các nhóm nhỏ"
    },
    {
      "thay_vi_noi": "Tập trung vào, câu dễ thế này mà không làm được!",
      "thu_noi": "Chỗ này mẹ thấy hơi rối một xíu. Con thử vẽ ra nháp cho mẹ xem con nghĩ thế nào nha.",
      "viec_lam_ngay": "Vẽ sơ đồ hoặc hình tròn đơn giản ra nháp"
    },
    {
      "thay_vi_noi": "Học trên lớp cô dạy thế nào mà về nhà quên hết?",
      "thu_noi": "Kiến thức mới nên con chưa quen ngay là bình thường thôi. Con chỉ cho mẹ chữ nào con thấy khó hiểu nhất nhé?",
      "viec_lam_ngay": "Dùng ngón tay chỉ vào từng từ trong đề bài"
    },
    {
      "thay_vi_noi": "Nghĩ nhanh lên, có mỗi phép tính mà ngồi ngẩn ngơ!",
      "thu_noi": "Con cứ bình tĩnh suy nghĩ, không cần vội đâu. Mẹ ngồi đây đợi con đếm xong nha.",
      "viec_lam_ngay": "Đặt một cốc nước ấm trước mặt con"
    },
    {
      "thay_vi_noi": "Con không chịu động não gì cả!",
      "thu_noi": "Mình chẻ bài toán này làm 2 phần nhỏ nhé. Bước đầu tiên đề bài cho biết số mấy hả con?",
      "viec_lam_ngay": "Gấp nửa dưới tờ đề lại, chỉ nhìn nửa trên"
    },
    {
      "thay_vi_noi": "Hôm qua vừa làm xong hôm nay lại quên sạch!",
      "thu_noi": "Hôm qua con đã vượt qua bài tương tự rất giỏi rồi. Hôm nay mình tìm lại bí kíp hôm qua nhé!",
      "viec_lam_ngay": "Mở lại trang vở hôm qua con đã làm đúng"
    },
    {
      "thay_vi_noi": "Sai bét rồi, đọc lại đề đi!",
      "thu_noi": "Ồ số này gần đúng rồi đấy! Con thử đếm lại nhóm thứ hai xem có bạn nào chạy nhầm không?",
      "viec_lam_ngay": "Mẹ và con cùng đếm nhẩm từng nhóm 1-2-3"
    },
    {
      "thay_vi_noi": "Sao không hỏi mẹ sớm mà ngồi im đấy?",
      "thu_noi": "Con vướng ở chỗ nào cứ nói với mẹ nhé, mẹ con mình cùng gỡ từng nút thắt.",
      "viec_lam_ngay": "Vỗ nhẹ vào vai động viên con"
    }
  ],
  "distracted": [
    {
      "thay_vi_noi": "Con ngồi yên xem nào, mắt nhìn đi đâu đấy?",
      "thu_noi": "Não con đang muốn giải lao tí xíu đó. Hai mẹ con mình đứng lên vươn vai 1 phút cho tỉnh nha!",
      "viec_lam_ngay": "Vươn vai và nhảy lò cò 10 bước"
    },
    {
      "thay_vi_noi": "Cứ nghịch ngợm thế này thì bao giờ mới xong bài!",
      "thu_noi": "Mình thi xem ai tìm được 3 đồ vật màu đỏ trong phòng nhanh hơn, rồi quay lại chiến tiếp!",
      "viec_lam_ngay": "Trò chơi tìm đồ vật 1 phút"
    },
    {
      "thay_vi_noi": "Để cái bút xuống, quay mặt vào bàn ngay!",
      "thu_noi": "Bàn tay con đang mỏi đúng không? Mình cùng xoa hai lòng bàn tay cho ấm lên nào!",
      "viec_lam_ngay": "Xoa hai lòng bàn tay ấm và áp nhẹ lên mắt"
    },
    {
      "thay_vi_noi": "Ngồi học 5 phút mà đòi đi vệ sinh mấy lần!",
      "thu_noi": "Con uống một ngụm nước nhỏ, rồi mẹ con mình cùng chinh phục nốt bậc này trong 3 phút nhé!",
      "viec_lam_ngay": "Hẹn giờ đồng hồ cát 3 phút"
    },
    {
      "thay_vi_noi": "Mắt con để trên trán à?",
      "thu_noi": "Đôi mắt con cần nghỉ ngơi 30 giây rồi. Con nhắm mắt lại tưởng tượng một bầu trời xanh biếc nha.",
      "viec_lam_ngay": "Nhắm mắt thư giãn 30 giây"
    },
    {
      "thay_vi_noi": "Học cho con chứ học cho mẹ đâu mà lơ đãng thế!",
      "thu_noi": "Con đóng vai thầy giáo chấm điểm xem mẹ viết số này đẹp chưa nha!",
      "viec_lam_ngay": "Đổi bút cho con chấm điểm một phép tính"
    },
    {
      "thay_vi_noi": "Cả ngày chơi chưa chán hay sao mà giờ ngồi nghịch?",
      "thu_noi": "Nốt một câu này là con được tự do chơi lego rồi. Mình cùng tăng tốc nhé!",
      "viec_lam_ngay": "Đặt món đồ chơi con thích ở góc bàn làm mốc"
    },
    {
      "thay_vi_noi": "Mẹ đếm đến 3 mà không tập trung là ăn phạt đấy!",
      "thu_noi": "Hai mẹ con mình cùng đập tay high-five một cái thật kêu để lấy lại năng lượng nào!",
      "viec_lam_ngay": "High-five và hô vang quyết tâm"
    }
  ],
  "frustrated": [
    {
      "thay_vi_noi": "Mẹ mệt mỏi với con lắm rồi đấy nhé!",
      "thu_noi": "Mẹ xin lỗi, tự nhiên mẹ hơi mệt một xíu. Hai mẹ con mình cùng uống ngụm nước rồi thở dài một hơi thật êm nha.",
      "viec_lam_ngay": "Mẹ uống ngụm nước ấm và thở dài kép 3 lần"
    },
    {
      "thay_vi_noi": "Học với hành thế này làm mẹ phát điên lên mất!",
      "thu_noi": "Hai mẹ con mình cùng ngồi tựa lưng nghỉ 30 giây nha. Mẹ cần nạp lại pin một chút xíu.",
      "viec_lam_ngay": "Ngồi tựa lưng nhắm mắt thả lỏng vai"
    },
    {
      "thay_vi_noi": "Tại sao đứa khác học giỏi thế mà con lại thế này?",
      "thu_noi": "Mỗi bạn có một nhịp học riêng. Con của mẹ đang rất nỗ lực theo cách của con.",
      "viec_lam_ngay": "Hít sâu một hơi và mỉm cười với con"
    },
    {
      "thay_vi_noi": "Mẹ nói thế mà tai con điếc à?",
      "thu_noi": "Mẹ hạ giọng xuống nhé. Mẹ nói nhỏ xíu con nghe xem mẹ vừa nói số mấy nào?",
      "viec_lam_ngay": "Nói thì thầm để con chú ý lắng nghe"
    },
    {
      "thay_vi_noi": "Không muốn dạy nữa, tự đi mà làm!",
      "thu_noi": "Mẹ ra ban công hít thở không khí 1 phút rồi vào đồng hành tiếp cùng con yêu nhé.",
      "viec_lam_ngay": "Mẹ bước ra chỗ thoáng 1 phút"
    },
    {
      "thay_vi_noi": "Con cố tình chống đối mẹ đúng không?",
      "thu_noi": "Mẹ biết con cũng đang rất muốn làm đúng mà chưa tìm ra cách. Mẹ con mình là một đội!",
      "viec_lam_ngay": "Nắm tay con thật nhẹ nhàng"
    },
    {
      "thay_vi_noi": "Tốn bao nhiêu tiền cho đi học mà chẳng được tích sự gì!",
      "thu_noi": "Quan trọng nhất là hôm nay con học được thêm một cách tư duy mới, không sao cả.",
      "viec_lam_ngay": "Nhắc lại một điểm tốt con đã làm từ đầu buổi"
    },
    {
      "thay_vi_noi": "Mẹ không còn kiên nhẫn nữa đâu!",
      "thu_noi": "Mẹ thở ra một cái thật sâu nào. Mẹ kiên nhẫn cùng con được mà.",
      "viec_lam_ngay": "Thở ra kéo dài gấp đôi lúc hít vào"
    }
  ],
  "late": [
    {
      "thay_vi_noi": "Làm mãi không xong thế này thì bao giờ mới được ngủ?",
      "thu_noi": "Hôm nay con đã rất cố gắng vượt qua các bậc rồi. Dừng ở đây cũng là một tối học rất tốt. Mình đi ngủ, mai làm tiếp nha!",
      "viec_lam_ngay": "Lưu bài lại và cất sách vở vào cặp"
    },
    {
      "thay_vi_noi": "Thôi dẹp đi không học nữa, mai cô phạt ráng chịu!",
      "thu_noi": "Muộn rồi, sức khoẻ của con là quan trọng nhất. Mình lưu lại bậc này, mai tỉnh táo làm tiếp sẽ vèo cái là xong ngay.",
      "viec_lam_ngay": "Gấp vở lại và chúc con ngủ ngon"
    },
    {
      "thay_vi_noi": "Tại con lề mề từ tối nên giờ mới khuya khoắt thế này!",
      "thu_noi": "Giờ đi ngủ đến rồi. Con đã giải quyết được một nửa bài toán, rất đáng khen. Mai mình dậy sớm 10 phút nhé.",
      "viec_lam_ngay": "Đánh răng và chuẩn bị giường ngủ"
    },
    {
      "thay_vi_noi": "Thức đến 12h đêm cũng phải làm cho xong!",
      "thu_noi": "Giấc ngủ quý giá hơn một bài tập con nhé. Não con cần ngủ để ghi nhớ những gì hôm nay đã học.",
      "viec_lam_ngay": "Tắt đèn bàn học, bật đèn ngủ dịu"
    },
    {
      "thay_vi_noi": "Mai cô giáo kiểm tra thì con tự chịu trách nhiệm!",
      "thu_noi": "Mẹ sẽ viết lời nhắn nhỏ cho cô là con đã nỗ lực đến 9h30 tối. Con yên tâm đi ngủ nhé.",
      "viec_lam_ngay": "Viết mẩu giấy nhắn kẹp vào trang vở"
    },
    {
      "thay_vi_noi": "Ngáp ngắn ngáp dài thế thì học cái gì nữa!",
      "thu_noi": "Cơn buồn ngủ kéo đến rồi kìa. Cất sách vở thôi nào, mai con sẽ tỉnh táo và làm nhoáy cái là xong.",
      "viec_lam_ngay": "Cùng con dọn bàn học gọn gàng"
    },
    {
      "thay_vi_noi": "Cứ vừa làm vừa mơ mộng cho muộn!",
      "thu_noi": "Tối nay con đã ngồi học đúng giờ và nỗ lực. Giờ là lúc thưởng cho cơ thể một giấc ngủ thật ngon.",
      "viec_lam_ngay": "Ôm con và dặn dò nhẹ nhàng"
    },
    {
      "thay_vi_noi": "Đóng sách lại ngay, đi ngủ!",
      "thu_noi": "Tối nay mẹ con mình tạm dừng ở đây nhé. Con đã làm rất tốt bậc 1 và bậc 2 rồi đấy!",
      "viec_lam_ngay": "Gấp sách và hôn trán con"
    }
  ]
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
