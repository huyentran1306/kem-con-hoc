import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { aiExplain } from '../src/api.js'

async function run() {
  console.log('🚀 Chạy test aiExplain với mocked / intercepted fetch...')

  const problemLop3 = 'Có 3 hộp bút, mỗi hộp 8 cây. Mẹ cho bạn Na 5 cây. Hỏi mẹ còn lại bao nhiêu cây bút?'
  const child = {
    id: 'child_na_01',
    name: 'Bé Na',
    grade: 'Lớp 3',
    book: 'Kết nối tri thức',
    bearMemory: true,
  }

  let interceptedChat = null

  // Mock global fetch để bắt request /chat thực sự do aiExplain tạo ra
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).includes('/chat')) {
      interceptedChat = {
        url: String(url),
        headers: options.headers || {},
        postData: JSON.parse(options.body || '{}'),
      }

      console.log('📡 ĐÃ BẮT ĐƯỢC REQUEST /chat DO aiExplain TẠO RA!')
      console.log('Headers:', interceptedChat.headers)

      // Mock response hợp lệ
      return {
        ok: true,
        status: 200,
        json: async () => ({
          response: JSON.stringify({
            cac_bac: [
              {
                cau_hoi: 'Mẹ có tất cả mấy hộp bút và mỗi hộp có mấy cây bút?',
                ly_do_cho_me: 'Giúp con nhận biết số lượng ban đầu',
                dap_an_cho_me: 'Có 3 hộp bút, mỗi hộp 8 cây',
                goi_y: { muc_1_do_vat: 'Đếm số que tính', muc_2_hinh_ve: 'Vẽ 3 nhóm bút' },
              },
              {
                cau_hoi: 'Để tìm tổng số bút lúc đầu, con dùng phép tính gì?',
                ly_do_cho_me: 'Tìm số bút ban đầu',
                dap_an_cho_me: '3 x 8 = 24',
                goi_y: { muc_1_do_vat: 'Lấy 3 lần 8 que tính', muc_2_hinh_ve: 'Vẽ sơ đồ 3 đoạn' },
              },
              {
                cau_hoi: 'Mẹ cho bạn Na mấy cây và còn lại bao nhiêu cây bút?',
                ly_do_cho_me: 'Tìm số bút còn lại',
                dap_an_cho_me: '24 - 5 = 19',
                goi_y: { muc_1_do_vat: 'Bớt đi 5 que', muc_2_hinh_ve: 'Gạch bớt 5 phần' },
              },
            ],
            dap_an_cuoi_cho_me: '19 cây bút',
            khen_ngoi: 'Con đã tìm ra đáp án rất giỏi!',
          }),
        }),
      }
    }
    return originalFetch(url, options)
  }

  try {
    await aiExplain(problemLop3, child, 'Dịu dàng', '', false, { familyId: 'fam_na_2026' })
  } catch (e) {
    console.warn('aiExplain call notice:', e.message)
  }

  globalThis.fetch = originalFetch

  if (!interceptedChat) {
    console.error('❌ Không bắt được request /chat!')
    process.exit(1)
  }

  const sysMsg = interceptedChat.postData?.messages?.find((m) => m.role === 'system')?.content || ''
  const hasSingaporeCpa = sysMsg.includes('Singapore CPA')
  const phuongPhapLine = sysMsg.split('\n').find((l) => l.startsWith('PHƯƠNG PHÁP:')) || ''

  console.log('\n--- KẾT QUẢ KIỂM TRA REQUEST /chat ---')
  console.log('✓ X-Prompt-Id:', interceptedChat.headers['X-Prompt-Id'])
  console.log('✓ X-Grade:', decodeURIComponent(interceptedChat.headers['X-Grade'] || ''))
  console.log('✓ X-Book-Series:', decodeURIComponent(interceptedChat.headers['X-Book-Series'] || ''))
  console.log('✓ X-Subject:', decodeURIComponent(interceptedChat.headers['X-Subject'] || ''))
  console.log('✓ X-Child-Id:', decodeURIComponent(interceptedChat.headers['X-Child-Id'] || ''))
  console.log('✓ Chứa Singapore CPA:', hasSingaporeCpa)
  console.log('✓', phuongPhapLine)

  if (!hasSingaporeCpa) {
    console.error('❌ Lỗi: System prompt không chứa Singapore CPA!')
    process.exit(1)
  }

  // Chụp ảnh bằng chứng trực quan bằng Playwright
  console.log('\n📸 Khởi tạo Playwright để chụp ảnh bằng chứng...')
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage({ viewport: { width: 780, height: 680 } })

  const lines = sysMsg.split('\n').slice(0, 16).join('\n')

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #0B1120;
          color: #F8FAFC;
          padding: 24px;
          margin: 0;
          box-sizing: border-box;
        }
        .card {
          background: #1E293B;
          border: 1px solid #334155;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.5);
        }
        h2 { margin-top: 0; color: #38BDF8; font-size: 19px; display: flex; align-items: center; justify-content: space-between; }
        .badge { background: #0369A1; color: #E0F2FE; padding: 4px 12px; border-radius: 6px; font-size: 13px; font-weight: bold; }
        .grid-headers {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 16px;
          background: #0F172A;
          border-radius: 10px;
          padding: 14px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 12px;
          line-height: 1.6;
          color: #94A3B8;
          margin-bottom: 16px;
          border: 1px solid #334155;
        }
        .header-item span { color: #34D399; font-weight: bold; }
        .highlight-box {
          background: linear-gradient(135deg, rgba(6, 78, 59, 0.9), rgba(15, 118, 110, 0.85));
          border: 1.5px solid #10B981;
          border-radius: 10px;
          padding: 14px 16px;
          margin-bottom: 16px;
          color: #ECFDF5;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.5;
        }
        .highlight-box .tag { font-size: 12px; color: #6EE7B7; text-transform: uppercase; letter-spacing: 0.5px; }
        .highlight-box .val { color: #FDE047; font-weight: 800; font-size: 15px; display: block; margin-top: 4px; }
        pre {
          background: #0F172A;
          padding: 16px;
          border-radius: 10px;
          font-size: 11.5px;
          color: #CBD5E1;
          overflow-x: auto;
          white-space: pre-wrap;
          line-height: 1.55;
          border: 1px solid #334155;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>
          <span>🛰️ Request POST /chat · Prompt 23P Router & Sư Phạm Lớp 3</span>
          <span class="badge">Đã xác thực</span>
        </h2>
        <div class="grid-headers">
          <div class="header-item">X-Prompt-Id: <span>${interceptedChat.headers['X-Prompt-Id']}</span></div>
          <div class="header-item">X-Grade: <span>${decodeURIComponent(interceptedChat.headers['X-Grade'] || '')}</span></div>
          <div class="header-item">X-Subject: <span>${decodeURIComponent(interceptedChat.headers['X-Subject'] || '')}</span></div>
          <div class="header-item">X-Book-Series: <span>${decodeURIComponent(interceptedChat.headers['X-Book-Series'] || '')}</span></div>
          <div class="header-item">X-Child-Id: <span>${decodeURIComponent(interceptedChat.headers['X-Child-Id'] || '')}</span></div>
          <div class="header-item">X-Family-Id: <span>${decodeURIComponent(interceptedChat.headers['X-Family-Id'] || '')}</span></div>
        </div>
        <div class="highlight-box">
          <div class="tag">✅ DÒNG PHƯƠNG PHÁP GỬI LÊN AI KHI SOẠN ĐỀ TOÁN LỜI VĂN LỚP 3:</div>
          <div class="val">${phuongPhapLine}</div>
        </div>
        <pre><code>${lines}...\n[ĐẦU RA JSON DUY NHẤT]</code></pre>
      </div>
    </body>
    </html>
  `)

  const outPath = path.resolve('bang-chung/prompt23p/request_chat_singapore_cpa.png')
  await page.screenshot({ path: outPath })
  console.log(`📸 Đã chụp và lưu bằng chứng thành công: ${outPath}`)

  await browser.close()
}

run().catch((err) => {
  console.error('Lỗi thực thi:', err)
  process.exit(1)
})
