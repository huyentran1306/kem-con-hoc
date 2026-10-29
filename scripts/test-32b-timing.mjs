import { renderPrompt } from '../src/promptStudio.js';

const WORKER_URL = 'https://ai-gateway-worker.trannth1306.workers.dev/chat';
const PROBLEM = 'Bác Ba có 52 quả trứng, bác bán đi 17 quả, sau đó mua thêm 9 quả. Hỏi bác Ba có bao nhiêu quả trứng?';

const sys = renderPrompt('p3_explain_v3', {
  mon: 'Toán',
  lop: 'Lớp 3',
  sach: 'Kết nối tri thức',
  dang_bai: 'Toán có lời văn hai bước tính',
  loi_hay_gap: 'Tính sai bước 1 hoặc nhầm phép tính',
  giong: 'Dịu dàng',
  de_bai: PROBLEM,
  ghi_chu: '',
  isStuck: false,
  ho_so_con: '',
  doan_phuong_phap: '',
  phuong_phap: '',
  xung_ho: 'mẹ',
});

const userPrompt = `Soạn bài cho đề sau theo đúng schema. Chỉ trả JSON.\nĐề bài: """${PROBLEM}"""`;

const headers = {
  'Content-Type': 'application/json',
  'X-Prompt-Id': 'p3_explain_v3',
  'X-Problem-Text': encodeURIComponent(PROBLEM),
  'X-Family-Id': 'fam_test_dot32b_timing',
  'X-Grade': encodeURIComponent('Lớp 3'),
  'X-Book-Series': encodeURIComponent('Kết nối tri thức'),
  'X-Subject': encodeURIComponent('Toán'),
  'X-Child-Id': 'child_test_32b',
};

const payload = {
  messages: [
    { role: 'system', content: sys },
    { role: 'user', content: userPrompt },
  ],
  max_tokens: 900,
  temperature: 0.3,
  model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
};

async function testTiming() {
  console.log('=== LẦN 1: Soạn đề mới (chưa có trong cache) ===');
  console.log('Đề bài:', PROBLEM);
  const t1Start = Date.now();
  const res1 = await fetch(WORKER_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const t1Total = Date.now() - t1Start;
  const data1 = await res1.json();
  console.log('HTTP Status 1:', res1.status);
  console.log('Timing 1:', JSON.stringify(data1.timing, null, 2));
  console.log('Cached 1:', data1.cached || false);
  console.log('Client total ms 1:', t1Total);

  let lesson1 = null;
  try {
    lesson1 = typeof data1.response === 'string' ? JSON.parse(data1.response) : data1.response;
  } catch (e) {
    console.error('Parse error 1:', e);
  }
  if (lesson1) {
    console.log(`Số bậc: ${lesson1.cac_bac?.length}`);
    lesson1.cac_bac?.forEach((b, idx) => {
      console.log(`  Bậc ${idx + 1} (${b.ky_nang}): "${b.cau_hoi}"`);
      console.log(`    -> Đáp án cho mẹ: "${b.dap_an_cho_me}"`);
    });
  }

  console.log('\n=== LẦN 2: Soạn lại cùng đề (kiểm tra cache) ===');
  const t2Start = Date.now();
  const res2 = await fetch(WORKER_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const t2Total = Date.now() - t2Start;
  const data2 = await res2.json();
  console.log('HTTP Status 2:', res2.status);
  console.log('Timing 2:', JSON.stringify(data2.timing, null, 2));
  console.log('Cached 2:', data2.cached || false);
  console.log('Client total ms 2:', t2Total);

  return { data1, t1Total, data2, t2Total };
}

testTiming().catch(console.error);
